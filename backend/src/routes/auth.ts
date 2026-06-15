import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { XpLog } from '../models/XpLog';
import { applyLevelUp } from '../utils/levelUp';
import { grantAchievement } from '../utils/achievements';

const router = Router();

// POST /api/auth/register — cria perfil no MongoDB após cadastro no Firebase
router.post('/register', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, semester, course } = req.body;

    if (!name || !email || !semester || !course) {
      res.status(400).json({ error: 'Campos obrigatórios: name, email, semester, course' });
      return;
    }

    const existing = await User.findOne({ firebaseUid: req.uid });
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    const user = await User.create({
      firebaseUid: req.uid,
      name,
      email,
      semester: Number(semester),
      course,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar perfil' });
  }
});

// PATCH /api/auth/profile — atualiza perfil do usuário
router.patch('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, course, semester } = req.body;

    const update: Record<string, any> = {};
    if (name?.trim()) update.name = name.trim();
    if (course?.trim()) update.course = course.trim();
    if (semester) {
      const sem = Number(semester);
      if (!isNaN(sem) && sem >= 1 && sem <= 10) update.semester = sem;
    }

    if (Object.keys(update).length === 0) {
      res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
      return;
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.uid },
      { $set: update },
      { new: true },
    );

    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// POST /api/auth/checkin — check-in diário
router.post('/checkin', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Já fez check-in hoje?
    if (user.lastCheckIn && user.lastCheckIn >= todayStart) {
      res.status(400).json({ error: 'Você já fez check-in hoje.' });
      return;
    }

    // Calcular streak
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const wasYesterday = user.lastCheckIn && user.lastCheckIn >= yesterdayStart && user.lastCheckIn < todayStart;
    const newStreak = wasYesterday ? user.checkInStreak + 1 : 1;

    // Recompensas: XP escala com streak (20 base +5/dia, cap 50), HP +10
    const xpGain = Math.min(20 + (newStreak - 1) * 5, 50);
    const hpGain = 10;

    user.xp += xpGain;
    user.hp = Math.min(user.hp + hpGain, user.maxHp);
    user.lastCheckIn = now;
    user.checkInStreak = newStreak;
    const leveled = applyLevelUp(user);
    await user.save();

    await XpLog.create({
      user: user._id,
      amount: xpGain,
      reason: leveled
        ? `Check-in dia ${newStreak} (+nível!)`
        : `Check-in dia ${newStreak}`,
    });

    if (newStreak >= 3) await grantAchievement(user._id as any, 'streak_3');
    if (newStreak >= 7) await grantAchievement(user._id as any, 'streak_7');

    res.json({ user, rewards: { xp: xpGain, hp: hpGain, streak: newStreak } });
  } catch {
    res.status(500).json({ error: 'Erro ao realizar check-in' });
  }
});

// POST /api/auth/heal — usa poção de HP (30 XP → +30 HP)
router.post('/heal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

    const COST = 30;
    const GAIN = 30;

    if (user.hp >= user.maxHp) {
      res.status(400).json({ error: 'Seu HP já está cheio.' });
      return;
    }
    if (user.xp < COST) {
      res.status(400).json({ error: `XP insuficiente. Você precisa de ${COST} XP.` });
      return;
    }

    user.xp -= COST;
    user.hp = Math.min(user.hp + GAIN, user.maxHp);
    await user.save();

    await XpLog.create({
      user: user._id,
      amount: -COST,
      reason: `Poção de HP usada (+${GAIN} HP)`,
    });

    await grantAchievement(user._id as any, 'pocao');

    res.json({ user, gained: GAIN });
  } catch {
    res.status(500).json({ error: 'Erro ao usar poção' });
  }
});

// GET /api/auth/me — retorna perfil do usuário autenticado
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) {
      res.status(404).json({ error: 'Perfil não encontrado' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

export default router;
