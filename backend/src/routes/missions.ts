import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Mission } from '../models/Mission';
import { User } from '../models/User';
import { applyLevelUp } from '../utils/levelUp';

const router = Router();
router.use(authMiddleware);

// POST /api/missions — criar missão
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const { title, description, type, xpReward, hpPenalty, deadline, assignToClan } = req.body;

    if (!title || !description || !type || !deadline) {
      res.status(400).json({ error: 'Campos obrigatórios: title, description, type, deadline' });
      return;
    }

    const isClan = assignToClan && user.clan;
    const assignedTo = isClan
      ? (await User.find({ clan: user.clan })).map((u) => u._id)
      : [user._id];

    const mission = await Mission.create({
      title,
      description,
      type,
      xpReward: xpReward ?? 50,
      hpPenalty: hpPenalty ?? 10,
      deadline: new Date(deadline),
      createdBy: user._id,
      assignedTo,
      clan: isClan ? user.clan : null,
    });

    res.status(201).json(mission);
  } catch {
    res.status(500).json({ error: 'Erro ao criar missão' });
  }
});

// GET /api/missions/me — listar missões do usuário
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const personal = await Mission.find({
      assignedTo: user._id,
      clan: null,
    }).sort({ deadline: 1 });

    const clan = user.clan
      ? await Mission.find({ clan: user.clan }).sort({ deadline: 1 })
      : [];

    res.json({ personal, clan });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
});

// PATCH /api/missions/:id/complete — concluir missão
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const mission = await Mission.findOne({ _id: req.params.id, assignedTo: user._id });
    if (!mission) { res.status(404).json({ error: 'Missão não encontrada' }); return; }
    if (mission.status !== 'pending') { res.status(400).json({ error: 'Missão já finalizada' }); return; }

    mission.status = 'completed';
    mission.completedAt = new Date();
    await mission.save();

    // XP para todos os membros atribuídos + verificar level up
    const members = await User.find({ _id: { $in: mission.assignedTo } });
    for (const member of members) {
      member.xp += mission.xpReward;
      applyLevelUp(member);
      await member.save();
    }

    res.json(mission);
  } catch {
    res.status(500).json({ error: 'Erro ao concluir missão' });
  }
});

// PATCH /api/missions/:id/fail — falhar missão
router.patch('/:id/fail', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const mission = await Mission.findOne({ _id: req.params.id, assignedTo: user._id });
    if (!mission) { res.status(404).json({ error: 'Missão não encontrada' }); return; }
    if (mission.status !== 'pending') { res.status(400).json({ error: 'Missão já finalizada' }); return; }

    mission.status = 'failed';
    await mission.save();

    // HP penalty para todos os membros atribuídos
    await User.updateMany(
      { _id: { $in: mission.assignedTo } },
      { $inc: { hp: -mission.hpPenalty } },
    );

    res.json(mission);
  } catch {
    res.status(500).json({ error: 'Erro ao falhar missão' });
  }
});

export default router;
