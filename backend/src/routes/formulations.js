import { Router } from 'express';
import mongoose from 'mongoose';
import Formula from '../models/Formula.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();
const editableFields = [
  'name',
  'lab',
  'type',
  'date',
  'status',
  'ingredients',
  'summary',
  'procedure',
  'patentNotes',
  'extractedText',
  'visibility',
];

// Converte erros de handlers assíncronos em chamadas do fluxo de erro do Express.
function handleAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// Valida o identificador MongoDB antes que ele seja usado em uma consulta.
function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'O identificador da formulação é inválido.' });
  }
  return next();
}

// Mantém apenas campos permitidos nas operações de criação e edição.
function pickEditableFields(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([field]) => editableFields.includes(field)),
  );
}

// Confirma que o corpo recebido é um objeto JSON, e não uma lista ou valor nulo.
function isObjectBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

// Verifica os tipos dos campos editáveis antes de gravá-los no banco.
function hasValidFieldTypes(fields) {
  return Object.entries(fields).every(([field, value]) => {
    if (field === 'ingredients') {
      return Array.isArray(value) && value.every((ingredient) => typeof ingredient === 'string');
    }
    if (field === 'date') {
      return typeof value === 'string' || value instanceof Date;
    }
    if (field === 'sourcePages') {
      return Array.isArray(value) && value.every((page) => Number.isInteger(page) && page > 0);
    }
    return typeof value === 'string';
  });
}

router.get(
  '/',
  handleAsync(async (req, res) => {
    const filter = req.user?.isAdmin || req.user?.permissions.includes('read_private')
      ? {}
      : { visibility: 'public' };
    const query = Formula.find(filter).sort({ createdAt: -1 });
    const formulations = filter.visibility
      ? await query.select('-extractedText -sourceFileId -sourcePages')
      : await query;
    return res.json(formulations);
  }),
);

router.get(
  '/:id',
  validateId,
  handleAsync(async (req, res) => {
    const formulation = await Formula.findById(req.params.id);
    const canReadPrivate = req.user?.isAdmin || req.user?.permissions.includes('read_private');
    if (!formulation || (formulation.visibility !== 'public' && !canReadPrivate)) {
      return res.status(404).json({ error: 'Formulação não encontrada.' });
    }
    if (formulation.visibility === 'public' && !canReadPrivate && !req.user?.isAdmin) {
      const publicResult = formulation.toJSON();
      delete publicResult.extractedText;
      delete publicResult.sourceFileId;
      delete publicResult.sourcePages;
      return res.json(publicResult);
    }
    return res.json(formulation);
  }),
);

router.post(
  '/',
  requirePermission('edit_private'),
  handleAsync(async (req, res) => {
    if (!isObjectBody(req.body)) {
      return res.status(400).json({ error: 'Envie os dados da formulação em formato JSON.' });
    }
    const fields = pickEditableFields(req.body);
    if (Object.hasOwn(fields, 'visibility')) {
      return res.status(400).json({ error: 'Novas formulações são privadas. Publique-as depois da revisão.' });
    }
    if (!hasValidFieldTypes(fields)) {
      return res.status(400).json({ error: 'Um ou mais campos têm formato inválido.' });
    }
    if (!fields.name?.trim() || !fields.lab?.trim()) {
      return res.status(400).json({ error: 'Informe o nome do produto e o laboratório.' });
    }

    const formulation = await Formula.create({
      ...fields,
      visibility: 'private',
      createdBy: req.user._id,
    });
    return res.status(201).json(formulation);
  }),
);

router.post(
  '/import',
  requirePermission('edit_private'),
  handleAsync(async (req, res) => {
    if (!isObjectBody(req.body) || !Array.isArray(req.body.formulations)) {
      return res.status(400).json({ error: 'Envie as formulações importadas em uma lista.' });
    }
    if (req.body.formulations.length === 0 || req.body.formulations.length > 200) {
      return res.status(400).json({ error: 'Selecione de 1 a 200 formulações para importar.' });
    }

    const formulations = req.body.formulations;
    for (const [index, item] of formulations.entries()) {
      if (!isObjectBody(item)) {
        return res.status(400).json({ error: `A linha ${index + 1} tem formato inválido.` });
      }
      if (
        typeof item.name !== 'string'
        || !item.name.trim()
        || item.name.length > 200
        || typeof item.lab !== 'string'
        || !item.lab.trim()
        || item.lab.length > 200
        || !Array.isArray(item.ingredients)
        || item.ingredients.length > 100
        || item.ingredients.some((value) => typeof value !== 'string' || !value.trim() || value.length > 300)
        || typeof item.summary !== 'string'
        || item.summary.length > 5000
        || typeof item.procedure !== 'string'
        || item.procedure.length > 20000
        || typeof item.patentNotes !== 'string'
        || item.patentNotes.length > 5000
        || typeof item.extractedText !== 'string'
        || item.extractedText.length > 500000
        || Object.hasOwn(item, 'visibility')
      ) {
        return res.status(400).json({
          error: `Confira os campos da linha ${index + 1}: produto e laboratório são obrigatórios e os textos precisam respeitar os limites.`,
        });
      }
    }

    const imported = await Formula.insertMany(
      formulations.map((item) => ({
        name: item.name.trim(),
        lab: item.lab.trim(),
        type: 'Planilha',
        visibility: 'private',
        createdBy: req.user._id,
        ingredients: item.ingredients.map((value) => value.trim()),
        summary: item.summary.trim(),
        procedure: item.procedure.trim(),
        patentNotes: item.patentNotes.trim(),
        extractedText: item.extractedText,
      })),
      { ordered: true },
    );
    return res.status(201).json(imported);
  }),
);

router.patch(
  '/:id',
  validateId,
  handleAsync(async (req, res) => {
    if (!isObjectBody(req.body)) {
      return res.status(400).json({ error: 'Envie os dados da atualização em formato JSON.' });
    }
    const fields = pickEditableFields(req.body);
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'Envie pelo menos um campo válido para atualizar.' });
    }
    const current = await Formula.findById(req.params.id).select('visibility');
    if (!current) return res.status(404).json({ error: 'Formulação não encontrada.' });
    const canEdit = req.user?.isAdmin || req.user?.permissions.includes('edit_private');
    const canPublish = req.user?.isAdmin || req.user?.permissions.includes('publish');
    const visibilityOnly = Object.keys(fields).every((field) => field === 'visibility');
    if (!canEdit && !(visibilityOnly && canPublish)) {
      return res.status(403).json({ error: 'Sua conta não tem permissão para editar formulações.' });
    }
    if (!hasValidFieldTypes(fields)) {
      return res.status(400).json({ error: 'Um ou mais campos têm formato inválido.' });
    }
    if (Object.hasOwn(fields, 'visibility') && !canPublish) {
      return res.status(403).json({ error: 'Você não tem permissão para alterar a visibilidade.' });
    }
    if (fields.visibility && !['private', 'public'].includes(fields.visibility)) {
      return res.status(400).json({ error: 'A visibilidade deve ser pública ou privada.' });
    }

    const formulation = await Formula.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });
    if (!formulation) {
      return res.status(404).json({ error: 'Formulação não encontrada.' });
    }
    if (!req.user?.isAdmin && !req.user?.permissions.includes('read_private')) {
      const publicResult = formulation.toJSON();
      delete publicResult.extractedText;
      delete publicResult.sourceFileId;
      delete publicResult.sourcePages;
      return res.json(publicResult);
    }
    return res.json(formulation);
  }),
);

router.delete(
  '/:id',
  validateId,
  handleAsync(async (req, res) => {
    if (!req.user?.isAdmin && !req.user?.permissions.includes('edit_private')) {
      return res.status(403).json({ error: 'Sua conta não tem permissão para excluir formulações.' });
    }
    const formulation = await Formula.findByIdAndDelete(req.params.id);
    if (!formulation) {
      return res.status(404).json({ error: 'Formulação não encontrada.' });
    }
    return res.status(204).end();
  }),
);

export default router;
