import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { clanRouter } from './routes/clan.routes';
import { missionRouter } from './routes/mission.routes';
import { rankingRouter } from './routes/ranking.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/clans', clanRouter);
app.use('/api/missions', missionRouter);
app.use('/api/ranking', rankingRouter);

app.use(errorHandler);

export default app;
