import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { XpLog } from '../models/XpLog';

const router = Router();
router.use(authMiddleware);

// GET /api/xp-log/me — histórico de XP do usuário
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const logs = await XpLog.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ logs });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar histórico de XP' });
  }
});

export default router;
