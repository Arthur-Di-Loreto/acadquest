import api from '../config/api';

export interface PublicPlayer {
  _id: string;
  name: string;
  course: string;
  semester: number;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  clan: { _id: string; name: string; memberCount: number; hp: number; maxHp: number } | null;
  stats: { completed: number; failed: number };
}

export async function getPlayer(id: string): Promise<PublicPlayer> {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}
