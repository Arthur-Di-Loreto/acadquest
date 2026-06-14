import { Router } from 'express';
import { z } from 'zod';
import { Mission } from '../models/Mission';
import { Clan } from '../models/Clan';
import { User } from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/authenticate';

const router = Router();

const createMissionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  type: z.enum(['tcc', 'integrador', 'seminario', 'artigo', 'outro']),
  xpReward: z.number().int().min(10).max(1000),
  hpPenalty: z.number().int().min(0).max(50),
  deadline: z.string().datetime(),
  clanId: z.string(),
  assignedTo: z.array(z.string()).optional(),
});

// POST /api/missions
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const body = createMissionSchema.parse(req.body);
    const clan = await Clan.findById(body.clanId);
    if (!clan) {
      res.status(404).json({ error: 'Clan not found' });
      return;
    }

    const mission = await Mission.create({
      title: body.title,
      description: body.description,
      type: body.type,
      xpReward: body.xpReward,
      hpPenalty: body.hpPenalty,
      deadline: new Date(body.deadline),
      clan: clan._id,
      assignedTo: body.assignedTo ?? clan.members,
    });

    res.status(201).json({ mission });
  } catch (err) {
    next(err);
  }
});

// GET /api/missions/clan/:clanId
router.get('/clan/:clanId', authenticate, async (req, res, next) => {
  try {
    const missions = await Mission.find({ clan: req.params.clanId })
      .populate('assignedTo', 'name avatar')
      .sort({ deadline: 1 });

    res.json({ missions });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/missions/:id/complete
router.patch('/:id/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    if (mission.status === 'completed') {
      res.status(400).json({ error: 'Mission already completed' });
      return;
    }

    mission.status = 'completed';
    mission.completedAt = new Date();
    await mission.save();

    // Reward XP to clan and its members
    await Clan.findByIdAndUpdate(mission.clan, { $inc: { xp: mission.xpReward } });
    await User.updateMany(
      { _id: { $in: mission.assignedTo } },
      { $inc: { xp: Math.floor(mission.xpReward / (mission.assignedTo.length || 1)) } },
    );

    res.json({ mission });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/missions/:id/fail
router.patch('/:id/fail', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found' });
      return;
    }

    mission.status = 'failed';
    await mission.save();

    // Apply HP penalty to clan
    const clan = await Clan.findById(mission.clan);
    if (clan) {
      clan.hp = Math.max(0, clan.hp - mission.hpPenalty);
      await clan.save();
    }

    res.json({ mission, clan });
  } catch (err) {
    next(err);
  }
});

export { router as missionRouter };
