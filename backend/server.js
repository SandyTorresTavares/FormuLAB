import 'dotenv/config';
import bcrypt from 'bcryptjs';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import multer from 'multer';
import mongoose from 'mongoose';
import authRouter from './src/routes/auth.js';
import formulationsRouter from './src/routes/formulations.js';
import uploadsRouter from './src/routes/uploads.js';
import spreadsheetsRouter from './src/routes/spreadsheets.js';
import User from './src/models/User.js';
import { loadSessionUser } from './src/middleware/auth.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const localDevelopmentOriginPattern = /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/;

if (!process.env.MONGODB_URI) {
  throw new Error('Configure MONGODB_URI no arquivo backend/.env.');
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('Configure SESSION_SECRET com pelo menos 32 caracteres aleatórios no arquivo backend/.env.');
}

app.use(helmet());
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (
      !origin
      || origin === frontendUrl
      || (process.env.NODE_ENV !== 'production' && localDevelopmentOriginPattern.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error('Origem não autorizada pelo CORS.'));
  },
}));
app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || !req.get('origin')) {
    return next();
  }
  const origin = req.get('origin');
  if (
    origin === frontendUrl
    || (process.env.NODE_ENV !== 'production' && localDevelopmentOriginPattern.test(origin))
  ) {
    return next();
  }
  return res.status(403).json({ error: 'Origem não autorizada para esta operação.' });
});
app.use(express.json({ limit: '3mb' }));
app.use(session({
  name: 'formulab.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 8 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  },
}));
app.use(loadSessionUser);

// Informa se a API está disponível e se a conexão com o MongoDB está ativa.
app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'indisponível',
    database: databaseConnected ? 'conectado' : 'desconectado',
  });
});

app.use('/api/formulations', formulationsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/spreadsheets', spreadsheetsRouter);
app.use('/api/auth', authRouter);

// Converte erros de upload, validação e parsing em respostas HTTP consistentes.
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'O arquivo excede o limite de 10 MB.'
      : 'Não foi possível receber o arquivo enviado.';
    return res.status(status).json({ error: message });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'O corpo da requisição contém JSON inválido.' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'O texto selecionado é muito grande para salvar em uma única operação.' });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const existingAdmin = await User.findOne({ isAdmin: true });
  if (!existingAdmin) {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (
      !ADMIN_EMAIL
      || !ADMIN_PASSWORD
      || ADMIN_PASSWORD.length < 12
      || !/[a-z]/.test(ADMIN_PASSWORD)
      || !/[A-Z]/.test(ADMIN_PASSWORD)
      || !/\d/.test(ADMIN_PASSWORD)
    ) {
      throw new Error(
        'Primeira configuração: defina ADMIN_EMAIL e ADMIN_PASSWORD (12+ caracteres, maiúscula, minúscula e número) no backend/.env.',
      );
    }
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existingAccount = await User.findOne({ email });
    if (existingAccount) {
      throw new Error('O e-mail ADMIN_EMAIL já está cadastrado como uma conta não administradora.');
    }
    await User.create({
      name: ADMIN_NAME?.trim() || 'Administrador',
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      status: 'active',
      isAdmin: true,
      permissions: ['read_private', 'edit_private', 'publish'],
    });
    console.log(`Conta administradora inicial criada para ${email}. Remova ADMIN_PASSWORD do arquivo backend/.env.`);
  }
  app.listen(port, '127.0.0.1', () => {
    console.log(`FormuLAB API disponível em http://localhost:${port}`);
  });
} catch (error) {
  console.error('Não foi possível conectar ao MongoDB:', error.message);
  process.exitCode = 1;
}
