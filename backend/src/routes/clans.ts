import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Clan } from '../models/Clan';
import { User } from '../models/User';

const router = Router();
router.use(authMiddleware);

// POST /api/clans — criar clã
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
    if (user.clan) { res.status(400).json({ error: 'Você já está em um clã' }); return; }

    const { name } = req.body;
    if (!name?.trim()) { res.status(400).json({ error: 'Nome do clã é obrigatório' }); return; }

    const clan = await Clan.create({
      name: name.trim(),
      leader: user._id,
      members: [user._id],
      course: user.course,
      semester: user.semester,
    });

    user.clan = clan._id as any;
    await user.save();

    res.status(201).json(clan);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Já existe um clã com esse nome' });
    } else {
      res.status(500).json({ error: 'Erro ao criar clã' });
    }
  }
});

// POST /api/clans/join — entrar em um clã pelo código
router.post('/join', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
    if (user.clan) { res.status(400).json({ error: 'Você já está em um clã' }); return; }

    const { code } = req.body;
    if (!code?.trim()) { res.status(400).json({ error: 'Código do clã é obrigatório' }); return; }

    const clan = await Clan.findOne({ code: code.trim().toUpperCase() });
    if (!clan) { res.status(404).json({ error: 'Clã não encontrado com este código' }); return; }

    clan.members.push(user._id as any);
    await clan.save();

    user.clan = clan._id as any;
    await user.save();

    res.json(clan);
  } catch {
    res.status(500).json({ error: 'Erro ao entrar no clã' });
  }
});

// GET /api/clans/me — dados do clã do usuário
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
    if (!user.clan) { res.status(404).json({ error: 'Você não está em nenhum clã' }); return; }

    const clan = await Clan.findById(user.clan).populate('members', 'name xp level hp');
    if (!clan) { res.status(404).json({ error: 'Clã não encontrado' }); return; }

    res.json(clan);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar clã' });
  }
});

// DELETE /api/clans/leave — sair do clã
router.delete('/leave', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user || !user.clan) { res.status(400).json({ error: 'Você não está em nenhum clã' }); return; }

    const clan = await Clan.findById(user.clan);
    if (clan) {
      clan.members = clan.members.filter((m) => m.toString() !== (user._id as any).toString());
      if (clan.members.length === 0) {
        await clan.deleteOne();
      } else {
        if (clan.leader.toString() === (user._id as any).toString()) {
          clan.leader = clan.members[0];
        }
        await clan.save();
      }
    }

    user.clan = undefined;
    await user.save();

    res.json({ message: 'Você saiu do clã' });
  } catch {
    res.status(500).json({ error: 'Erro ao sair do clã' });
  }
});

export default router;
