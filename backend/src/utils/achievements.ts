import { Types } from 'mongoose';
import { UserAchievement } from '../models/UserAchievement';

export const ACHIEVEMENT_DEFS: Record<string, { label: string; description: string; icon: string }> = {
  primeira_missao: { label: 'Primeira Missão',  description: 'Concluiu sua primeira missão',         icon: '⚔️' },
  dez_missoes:     { label: 'Veterano',          description: 'Concluiu 10 missões',                  icon: '🏆' },
  nivel_5:         { label: 'Ascendente',        description: 'Atingiu o nível 5',                    icon: '⬆️' },
  nivel_10:        { label: 'Elite',             description: 'Atingiu o nível 10',                   icon: '💎' },
  streak_3:        { label: 'Consistente',       description: '3 dias consecutivos de check-in',      icon: '🔥' },
  streak_7:        { label: 'Dedicado',          description: '7 dias consecutivos de check-in',      icon: '🌟' },
  entrou_cla:      { label: 'Companheiro',       description: 'Entrou em um clã',                     icon: '🛡️' },
  lider_cla:       { label: 'Líder',             description: 'Criou um clã',                         icon: '👑' },
  pocao:           { label: 'Curandeiro',        description: 'Usou uma poção de HP',                 icon: '🧪' },
};

export async function grantAchievement(userId: Types.ObjectId, key: string): Promise<boolean> {
  try {
    await UserAchievement.create({ user: userId, key });
    return true;
  } catch {
    // índice único — já desbloqueada
    return false;
  }
}
