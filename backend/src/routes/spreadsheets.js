import { Router } from 'express';
import multer from 'multer';
import { parseSpreadsheetFile } from '../utils/spreadsheets.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requirePermission('edit_private'));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
});

// Recebe uma planilha, interpreta suas abas e devolve uma prévia para mapeamento.
router.post('/preview', upload.single('spreadsheet'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Selecione um arquivo .xlsx ou .csv.' });
  }

  try {
    const sheets = await parseSpreadsheetFile(req.file);
    if (sheets.length === 0) {
      return res.status(422).json({ error: 'Não foram encontrados cabeçalhos e linhas com dados na planilha.' });
    }
    return res.json({
      originalName: req.file.originalname,
      sheets,
    });
  } catch (error) {
    console.error(`Não foi possível ler a planilha ${req.file.originalname}:`, error);
    return res.status(422).json({
      error: error.message || 'Não foi possível ler a planilha enviada.',
    });
  }
});

export default router;
