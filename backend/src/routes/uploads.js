import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import Formula from '../models/Formula.js';
import UploadedFile from '../models/UploadedFile.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requirePermission('edit_private'));
const uploadDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));
const maxFileSize = 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize, files: 1, fields: 0 },
});
const maxExtractedPages = 100;
const maxExtractedCharacters = 500000;
const maxPageCharacters = 30000;
const allowedFileTypes = new Map([
  ['application/pdf', { extension: 'pdf', matchesName: /\.pdf$/i }],
  ['image/jpeg', { extension: 'jpg', matchesName: /\.(jpe?g)$/i }],
  ['image/png', { extension: 'png', matchesName: /\.png$/i }],
]);

// Confere se o identificador recebido pode ser usado em uma consulta MongoDB.
function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

// Encaminha falhas de processamento assíncrono para o tratamento global de erros.
function handleAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// Confirma a assinatura binária do arquivo para evitar confiar apenas no MIME informado.
function hasValidFileSignature(file) {
  if (file.mimetype === 'application/pdf') {
    return file.buffer.subarray(0, 1024).toString('latin1').includes('%PDF-');
  }
  if (file.mimetype === 'image/jpeg') {
    return file.buffer[0] === 0xff && file.buffer[1] === 0xd8 && file.buffer[2] === 0xff;
  }
  if (file.mimetype === 'image/png') {
    return file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return false;
}

router.post('/', upload.single('document'), async (req, res, next) => {
  let storedPath;

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Selecione um PDF ou uma imagem para enviar.' });
    }

    const fileType = allowedFileTypes.get(file.mimetype);
    if (!fileType || !fileType.matchesName.test(file.originalname) || !hasValidFileSignature(file)) {
      return res.status(400).json({ error: 'O arquivo enviado não corresponde a um PDF, JPEG ou PNG válido.' });
    }

    const storedName = `${randomUUID()}.${fileType.extension}`;
    storedPath = new URL(`../../uploads/${storedName}`, import.meta.url);
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(storedPath, file.buffer, { flag: 'wx' });

    const uploadedFile = await UploadedFile.create({
      originalName: file.originalname,
      storedName,
      size: file.size,
      mimeType: file.mimetype,
    });

    return res.status(201).json({
      id: uploadedFile.id,
      originalName: uploadedFile.originalName,
      size: uploadedFile.size,
      status: uploadedFile.status,
      createdAt: uploadedFile.createdAt,
      message: 'Arquivo recebido. Inicie a extração de texto para revisar o documento.',
    });
  } catch (error) {
    if (storedPath) {
      try {
        await unlink(storedPath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          return next(cleanupError);
        }
      }
    }
    return next(error);
  }
});

router.get(
  '/:id/text',
  handleAsync(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'O identificador do arquivo é inválido.' });
    }

    const uploadedFile = await UploadedFile.findById(req.params.id);
    if (!uploadedFile) {
      return res.status(404).json({ error: 'Arquivo enviado não encontrado.' });
    }

    const storedPath = fileURLToPath(new URL(`../../uploads/${uploadedFile.storedName}`, import.meta.url));
    const fileData = await readFile(storedPath);
    const isPdf = uploadedFile.mimeType === 'application/pdf';
    const parser = isPdf ? new PDFParse({ data: fileData }) : null;
    let worker;
    let ocrRequested = !isPdf;
    try {
      let totalPages = 1;
      let sourcePages = [{ num: 1, text: '' }];
      if (parser) {
        const info = await parser.getInfo();
        totalPages = info.total;
        if (totalPages > maxExtractedPages) {
          return res.status(413).json({
            error: `O PDF tem ${totalPages} páginas. O limite para a prévia é ${maxExtractedPages} páginas.`,
          });
        }

        const result = await parser.getText();
        sourcePages = result.pages;
      }

      const needsOcr = sourcePages.some(({ text }) => !text.trim());
      ocrRequested = !isPdf || needsOcr;
      if (!isPdf || needsOcr) {
        worker = await createWorker('por+eng');
      }

      const pages = [];
      for (const page of sourcePages) {
        let text = page.text;
        let extractionMethod = 'text';
        if (!text.trim()) {
          let imageData = fileData;
          if (parser) {
            const screenshot = await parser.getScreenshot({
              scale: 1.5,
              partial: [page.num],
              imageBuffer: true,
              imageDataUrl: false,
            });
            imageData = Buffer.from(screenshot.pages[0].data);
          }
          const recognized = await worker.recognize(imageData);
          text = recognized.data.text;
          extractionMethod = 'ocr';
        }
        pages.push({
          pageNumber: page.num,
          text: text.slice(0, maxPageCharacters),
          truncated: text.length > maxPageCharacters,
          extractionMethod,
        });
      }

      const totalCharacters = pages.reduce((total, page) => total + page.text.length, 0);
      if (totalCharacters > maxExtractedCharacters) {
        return res.status(413).json({
          error: 'O texto extraído é muito extenso para a prévia. Divida o documento em arquivos menores.',
        });
      }

      if (!pages.some(({ text }) => text.trim())) {
        return res.status(422).json({
          error: 'Não foi possível reconhecer texto. Tente uma imagem mais nítida ou um documento com melhor resolução.',
        });
      }

      return res.json({
        fileId: uploadedFile.id,
        originalName: uploadedFile.originalName,
        totalPages,
        pages,
      });
    } catch (error) {
      console.error(`Não foi possível processar o arquivo ${uploadedFile.id}:`, error);
      if (ocrRequested) {
        return res.status(503).json({
          error: 'Falha na leitura por OCR. Verifique o arquivo e a conexão para carregar os modelos de português e inglês e tente novamente.',
        });
      }
      return res.status(422).json({
        error: 'Não foi possível ler este PDF. Verifique se o arquivo está íntegro e não exige senha.',
      });
    } finally {
      if (worker) await worker.terminate();
      if (parser) await parser.destroy();
    }
  }),
);

router.patch(
  '/:id/selection',
  handleAsync(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'O identificador do arquivo é inválido.' });
    }
    if (!Array.isArray(req.body?.selectedPages) || req.body.selectedPages.length > maxExtractedPages) {
      return res.status(400).json({ error: 'Envie uma lista válida de páginas para guardar.' });
    }

    const selectedPages = req.body.selectedPages;
    const pageNumbers = new Set();
    let totalCharacters = 0;
    for (const page of selectedPages) {
      if (
        !Number.isInteger(page?.pageNumber)
        || page.pageNumber < 1
        || typeof page.text !== 'string'
        || page.text.trim().length === 0
        || page.text.length > maxPageCharacters
        || pageNumbers.has(page.pageNumber)
      ) {
        return res.status(400).json({
          error: 'Cada página selecionada deve ter número único e texto válido de até 30.000 caracteres.',
        });
      }
      pageNumbers.add(page.pageNumber);
      totalCharacters += page.text.length;
    }
    if (totalCharacters > maxExtractedCharacters) {
      return res.status(413).json({ error: 'A seleção excede o limite de texto permitido.' });
    }

    const uploadedFile = await UploadedFile.findByIdAndUpdate(
      req.params.id,
      { selectedPages, status: 'reviewed' },
      { new: true, runValidators: true },
    );
    if (!uploadedFile) {
      return res.status(404).json({ error: 'Arquivo enviado não encontrado.' });
    }

    return res.json({
      fileId: uploadedFile.id,
      selectedPages: uploadedFile.selectedPages,
      status: uploadedFile.status,
      message: 'Sua seleção de texto foi salva para revisão futura.',
    });
  }),
);

router.post(
  '/:id/formulation',
  handleAsync(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'O identificador do arquivo é inválido.' });
    }
    if (
      req.body === null
      || typeof req.body !== 'object'
      || Array.isArray(req.body)
    ) {
      return res.status(400).json({ error: 'Envie os dados da formulação em formato JSON.' });
    }

    const { name, lab, ingredients, summary, procedure, patentNotes } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.length > 200) {
      return res.status(400).json({ error: 'Informe o nome do produto (até 200 caracteres).' });
    }
    if (typeof lab !== 'string' || !lab.trim() || lab.length > 200) {
      return res.status(400).json({ error: 'Informe o laboratório (até 200 caracteres).' });
    }
    if (!Array.isArray(ingredients) || ingredients.length > 100) {
      return res.status(400).json({ error: 'Informe os ingredientes como uma lista de até 100 itens.' });
    }
    if (ingredients.some((ingredient) => typeof ingredient !== 'string' || !ingredient.trim() || ingredient.length > 300)) {
      return res.status(400).json({ error: 'Cada ingrediente deve conter texto de até 300 caracteres.' });
    }
    if (typeof summary !== 'string' || summary.length > 5000) {
      return res.status(400).json({ error: 'O resumo deve ter até 5.000 caracteres.' });
    }
    if (typeof procedure !== 'string' || procedure.length > 20000) {
      return res.status(400).json({ error: 'O procedimento deve ter até 20.000 caracteres.' });
    }
    if (typeof patentNotes !== 'string' || patentNotes.length > 5000) {
      return res.status(400).json({ error: 'As observações sobre patentes devem ter até 5.000 caracteres.' });
    }

    const uploadedFile = await UploadedFile.findById(req.params.id);
    if (!uploadedFile) {
      return res.status(404).json({ error: 'Arquivo enviado não encontrado.' });
    }
    if (uploadedFile.status !== 'reviewed' || uploadedFile.selectedPages.length === 0) {
      return res.status(409).json({
        error: 'Salve primeiro a seleção das páginas revisadas antes de cadastrar a formulação.',
      });
    }

    const formulation = await Formula.create({
      name: name.trim(),
      lab: lab.trim(),
      type: uploadedFile.mimeType === 'application/pdf' ? 'Documento PDF' : 'Imagem',
      visibility: 'private',
      createdBy: req.user._id,
      status: 'Em Análise',
      ingredients: ingredients.map((ingredient) => ingredient.trim()),
      summary: summary.trim(),
      procedure: procedure.trim(),
      patentNotes: patentNotes.trim(),
      extractedText: uploadedFile.selectedPages
        .map(({ pageNumber, text }) => `[Página ${pageNumber}]\n${text}`)
        .join('\n\n'),
      sourceFileId: uploadedFile._id,
      sourcePages: uploadedFile.selectedPages.map(({ pageNumber }) => pageNumber),
    });

    return res.status(201).json(formulation);
  }),
);

export default router;
