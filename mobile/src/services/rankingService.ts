import api from '../config/api';

export interface PlayerRank {
  position: number;
  _id: string;
  name: string;
  xp: number;
  level: number;
  hp: number;
  isMe: boolean;
}

export interface ClanRank {
  position: number;
  _id: string;
  name: string;
  hp: number;
  maxHp: number;
  memberCount: number;
  totalXp: number;
  isMine: boolean;
}

export async function getPlayerRanking(): Promise<{ course: string; semester: number; players: PlayerRank[] }> {
  const res = await api.get('/api/ranking/players');
  return res.data;
}

export async function getClanRanking(): Promise<{ course: string; semester: number; clans: ClanRank[] }> {
  const res = await api.get('/api/ranking/clans');
  return res.data;
}
