import { Router } from 'express';
import { z } from 'zod';
import { Clan } from '../models/Clan';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();

const createClanSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(300).optional(),
  emblem: z.string().url().optional(),
  semester: z.number().int().min(1).max(10),
  course: z.string().min(2).max(100),
});

// POST /api/clans
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createClanSchema.parse(req.body);
    const leader = await User.findOne({ firebaseUid: req.uid });
    if (!leader) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (leader.clan) {
      res.status(400).json({ error: 'User already belongs to a clan' });
      return;
    }

    const clan = await Clan.create({
      ...body,
      leader: leader._id,
      members: [leader._id],
    });

    leader.clan = clan._id;
    await leader.save();

    res.status(201).json({ clan });
  } catch (err) {
    next(err);
  }
});

// GET /api/clans/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const clan = await Clan.findById(req.params.id)
      .populate('members', 'name avatar xp level')
      .populate('leader', 'name avatar');

    if (!clan) {
      res.status(404).json({ error: 'Clan not found' });
      return;
    }

    res.json({ clan });
  } catch (err) {
    next(err);
  }
});

// POST /api/clans/:id/join
router.post('/:id/join', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.clan) {
      res.status(400).json({ error: 'User already belongs to a clan' });
      return;
    }

    const clan = await Clan.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: user._id } },
      { new: true },
    );

    if (!clan) {
      res.status(404).json({ error: 'Clan not found' });
      return;
    }

    user.clan = clan._id;
    await user.save();

    res.json({ clan });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clans/:id/leave
router.delete('/:id/leave', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.uid });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const clan = await Clan.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: user._id } },
      { new: true },
    );

    if (!clan) {
      res.status(404).json({ error: 'Clan not found' });
      return;
    }

    user.clan = undefined;
    await user.save();

    res.json({ message: 'Left clan successfully' });
  } catch (err) {
    next(err);
  }
});

export { router as clanRouter };
