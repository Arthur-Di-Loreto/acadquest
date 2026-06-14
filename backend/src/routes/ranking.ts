import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Clan } from '../models/Clan';

const router = Router();
router.use(authMiddleware);

// GET /api/ranking/players — top jogadores globais
router.get('/players', async (req: AuthRequest, res: Response) => {
  try {
    const me = await User.findOne({ firebaseUid: req.uid });
    if (!me) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const players = await User.find()
      .sort({ xp: -1 })
      .limit(50)
      .select('name xp level hp clan');

    const result = players.map((p, i) => ({
      position: i + 1,
      _id: p._id,
      name: p.name,
      xp: p.xp,
      level: p.level,
      hp: p.hp,
      isMe: (p._id as any).toString() === (me._id as any).toString(),
    }));

    res.json({ players: result });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// GET /api/ranking/clans — top clãs globais (por XP total dos membros)
router.get('/clans', async (req: AuthRequest, res: Response) => {
  try {
    const me = await User.findOne({ firebaseUid: req.uid });
    if (!me) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const clans = await Clan.find().populate('members', 'xp');

    const ranked = clans
      .map((c) => ({
        _id: c._id,
        name: c.name,
        hp: c.hp,
        maxHp: c.maxHp,
        memberCount: c.members.length,
        totalXp: (c.members as any[]).reduce((sum: number, m: any) => sum + (m.xp ?? 0), 0),
        isMine: me.clan?.toString() === (c._id as any).toString(),
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((c, i) => ({ ...c, position: i + 1 }));

    res.json({ clans: ranked });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ranking de clãs' });
  }
});

export default router;
