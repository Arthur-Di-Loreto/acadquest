import { Router } from 'express';
import { Clan } from '../models/Clan';
import { User } from '../models/User';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// GET /api/ranking/clans?semester=1&course=ADS
router.get('/clans', authenticate, async (req, res, next) => {
  try {
    const { semester, course } = req.query;
    const filter: Record<string, unknown> = {};
    if (semester) filter.semester = Number(semester);
    if (course) filter.course = course;

    const clans = await Clan.find(filter)
      .select('name emblem xp hp members semester course')
      .populate('members', 'name avatar')
      .sort({ xp: -1 })
      .limit(50);

    const ranked = clans.map((clan, index) => ({
      rank: index + 1,
      ...clan.toObject(),
    }));

    res.json({ ranking: ranked });
  } catch (err) {
    next(err);
  }
});

// GET /api/ranking/users?semester=1&course=ADS
router.get('/users', authenticate, async (req, res, next) => {
  try {
    const { semester, course } = req.query;
    const filter: Record<string, unknown> = {};
    if (semester) filter.semester = Number(semester);
    if (course) filter.course = course;

    const users = await User.find(filter)
      .select('name avatar xp level course semester')
      .sort({ xp: -1 })
      .limit(50);

    const ranked = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    res.json({ ranking: ranked });
  } catch (err) {
    next(err);
  }
});

export { router as rankingRouter };
