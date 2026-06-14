import { Mission } from '../models/Mission';
import { User } from '../models/User';
import { applyLevelUp } from '../utils/levelUp';

export async function expireMissions() {
  try {
    const overdue = await Mission.find({
      status: 'pending',
      deadline: { $lt: new Date() },
    });

    if (overdue.length === 0) return;

    for (const mission of overdue) {
      mission.status = 'failed';
      await mission.save();

      await User.updateMany(
        { _id: { $in: mission.assignedTo } },
        { $inc: { hp: -mission.hpPenalty } },
      );
    }

    console.log(`[expireMissions] ${overdue.length} missão(ões) expirada(s) processada(s)`);
  } catch (err) {
    console.error('[expireMissions] Erro:', err);
  }
}

export function startExpirationJob() {
  // Roda imediatamente ao iniciar e depois a cada hora
  expireMissions();
  setInterval(expireMissions, 60 * 60 * 1000);
  console.log('[expireMissions] Job iniciado (intervalo: 1h)');
}
