import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { UserAchievement } from '../models/UserAchievement';
import { ACHIEVEMENT_DEFS } from '../utils/achievements';

const router = Router();
router.use(authMiddleware);

// GET /api/achievements/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const unlocked = await UserAchievement.find({ user: user._id }).sort({ unlockedAt: 1 });
    const unlockedKeys = new Set(unlocked.map((a) => a.key));

    const all = Object.entries(ACHIEVEMENT_DEFS).map(([key, def]) => ({
      key,
      ...def,
      unlocked: unlockedKeys.has(key),
      unlockedAt: unlocked.find((a) => a.key === key)?.unlockedAt ?? null,
    }));

    res.json({ achievements: all });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

export default router;
