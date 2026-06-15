import api from '../config/api';

export interface Achievement {
  key: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export async function getMyAchievements(): Promise<Achievement[]> {
  const res = await api.get('/api/achievements/me');
  return res.data.achievements;
}
