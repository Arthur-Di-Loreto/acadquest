import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

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
