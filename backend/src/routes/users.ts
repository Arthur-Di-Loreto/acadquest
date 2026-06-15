import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Clan } from '../models/Clan';
import { Mission } from '../models/Mission';

const router = Router();
router.use(authMiddleware);

// GET /api/users/:id — perfil público de outro jogador
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const target = await User.findById(req.params.id).select('-firebaseUid -email');
    if (!target) { res.status(404).json({ error: 'Jogador não encontrado' }); return; }

    const clan = target.clan
      ? await Clan.findById(target.clan).select('name code members hp maxHp')
      : null;

    const completedCount = await Mission.countDocuments({
      assignedTo: target._id,
      status: 'completed',
    });

    const failedCount = await Mission.countDocuments({
      assignedTo: target._id,
      status: 'failed',
    });

    res.json({
      _id: target._id,
      name: target.name,
      course: target.course,
      semester: target.semester,
      xp: target.xp,
      level: target.level,
      hp: target.hp,
      maxHp: target.maxHp,
      clan: clan
        ? { _id: clan._id, name: clan.name, memberCount: clan.members.length, hp: clan.hp, maxHp: clan.maxHp }
        : null,
      stats: { completed: completedCount, failed: failedCount },
    });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar jogador' });
  }
});

export default router;
