import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import missionRoutes from './routes/missions';
import clanRoutes from './routes/clans';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/clans', clanRoutes);

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não definido no .env');

  await mongoose.connect(uri);
  console.log('MongoDB conectado');

  const port = process.env.PORT ?? 3000;
  app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
}

start().catch((err) => {
  console.error('Erro ao iniciar:', err.message);
  process.exit(1);
});
