import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  semester: z.number().int().min(1).max(10).optional(),
  course: z.string().min(2).max(100).optional(),
});

// PATCH /api/users/me
router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = updateSchema.parse(req.body);
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.uid },
      { $set: body },
      { new: true },
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid')
      .populate('clan', 'name emblem hp xp');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export { router as userRouter };
