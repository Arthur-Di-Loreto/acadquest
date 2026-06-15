import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import missionRoutes from './routes/missions';
import clanRoutes from './routes/clans';
import rankingRoutes from './routes/ranking';
import xpLogRoutes from './routes/xpLog';
import userRoutes from './routes/users';
import achievementRoutes from './routes/achievements';
import { startExpirationJob } from './jobs/expireMissions';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/clans', clanRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/xp-log', xpLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não definido no .env');

  await mongoose.connect(uri);
  console.log('MongoDB conectado');
  startExpirationJob();

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
}

start().catch((err) => {
  console.error('Erro ao iniciar:', err.message);
  process.exit(1);
});
