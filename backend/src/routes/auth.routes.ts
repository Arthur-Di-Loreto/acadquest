import { Router } from 'express';
import { z } from 'zod';
import { admin } from '../config/firebase';
import { User } from '../models/User';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  semester: z.number().int().min(1).max(10),
  course: z.string().min(2).max(100),
  avatar: z.string().url().optional(),
});

// POST /api/auth/register — called after Firebase sign-up to persist user in MongoDB
router.post('/register', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const body = registerSchema.parse(req.body);

    const existing = await User.findOne({ firebaseUid: decoded.uid });
    if (existing) {
      res.status(200).json({ user: existing });
      return;
    }

    const user = await User.create({
      firebaseUid: decoded.uid,
      name: body.name,
      email: body.email,
      semester: body.semester,
      course: body.course,
      avatar: body.avatar,
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — returns the current user profile
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decoded.uid }).populate('clan', 'name emblem hp');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
