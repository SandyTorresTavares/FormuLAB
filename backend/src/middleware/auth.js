import mongoose from 'mongoose';
import User from '../models/User.js';

// Encaminha rejeições de handlers assíncronos para o middleware de erros do Express.
export function handleAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// Expõe somente os dados da conta que podem ser enviados ao cliente.
export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    permissions: user.permissions,
  };
}

// Recupera a conta associada à sessão e a disponibiliza em req.user.
export const loadSessionUser = handleAsync(async (req, _res, next) => {
  const userId = req.session?.userId;
  if (!userId || !mongoose.isValidObjectId(userId)) return next();

  const user = await User.findOne({ _id: userId, status: 'active' });
  if (!user) {
    req.session.destroy((error) => {
      if (error) return next(error);
      return next();
    });
    return;
  }
  req.user = user;
  return next();
});

// Bloqueia a rota quando não existe uma sessão autenticada.
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Entre na sua conta para continuar.' });
  return next();
}

// Permite acesso a administradores ou a usuários com a permissão solicitada.
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Entre na sua conta para continuar.' });
    if (req.user.isAdmin || req.user.permissions.includes(permission)) return next();
    return res.status(403).json({ error: 'Sua conta não tem permissão para esta ação.' });
  };
}

// Restringe a rota exclusivamente à conta administradora.
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Entre na sua conta para continuar.' });
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Somente o administrador pode gerenciar contas.' });
  return next();
}
