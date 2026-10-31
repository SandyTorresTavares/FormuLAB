import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { handleAsync, requireAdmin, serializeUser } from '../middleware/auth.js';

const router = Router();
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,128}$/;
const allowedPermissions = new Set(['read_private', 'edit_private', 'publish']);
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
});
const dummyPasswordHash = bcrypt.hashSync(randomBytes(32).toString('hex'), 12);

// Constrói uma Promise para aguardar a renovação segura do identificador da sessão.
function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

// Persiste os dados atualizados da sessão antes de responder à requisição.
function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

// Encerra a sessão atual e permite que o logout trate falhas de forma assíncrona.
function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

router.post(
  '/register',
  authRateLimit,
  handleAsync(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (
      typeof name !== 'string'
      || !name.trim()
      || name.trim().length > 120
      || typeof email !== 'string'
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || email.length > 254
      || typeof password !== 'string'
      || !passwordPattern.test(password)
    ) {
      return res.status(400).json({
        error: 'Informe nome, e-mail válido e senha com 12 a 128 caracteres, incluindo maiúscula, minúscula e número.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        status: 'pending',
        permissions: [],
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Já existe uma solicitação ou conta para este e-mail.' });
      }
      throw error;
    }
    return res.status(201).json({
      message: 'Solicitação recebida. Aguarde a aprovação do administrador antes de entrar.',
    });
  }),
);

router.post(
  '/login',
  authRateLimit,
  handleAsync(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyPasswordHash);
    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({
        error: user.status === 'pending'
          ? 'Sua solicitação ainda aguarda aprovação do administrador.'
          : 'Esta conta está desativada.',
      });
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);
    return res.json({ user: serializeUser(user) });
  }),
);

router.post(
  '/logout',
  handleAsync(async (req, res) => {
    await destroySession(req);
    res.clearCookie('formulab.sid', { path: '/' });
    return res.status(204).end();
  }),
);

router.get('/me', (req, res) => {
  return res.json({ user: req.user ? serializeUser(req.user) : null });
});

router.get(
  '/users',
  requireAdmin,
  handleAsync(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  }),
);

router.patch(
  '/users/:id',
  requireAdmin,
  handleAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'O identificador da conta é inválido.' });
    }
    const { status, permissions } = req.body || {};
    if (!['active', 'disabled', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Informe um status válido para a conta.' });
    }
    if (
      !Array.isArray(permissions)
      || permissions.some((permission) => !allowedPermissions.has(permission))
      || new Set(permissions).size !== permissions.length
    ) {
      return res.status(400).json({ error: 'A lista de permissões contém valores inválidos.' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Conta não encontrada.' });
    if (target.isAdmin) {
      return res.status(403).json({ error: 'As contas de administrador não podem ser alteradas por esta tela.' });
    }
    target.status = status;
    target.permissions = permissions;
    await target.save();
    return res.json(target);
  }),
);

export default router;
