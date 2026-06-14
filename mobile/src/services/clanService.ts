import api from '../config/api';

export interface ClanMember {
  _id: string;
  name: string;
  xp: number;
  level: number;
  hp: number;
}

export interface Clan {
  _id: string;
  name: string;
  code: string;
  hp: number;
  maxHp: number;
  course: string;
  semester: number;
  members: ClanMember[];
  leader: string;
}

export async function getMyClan(): Promise<Clan> {
  const res = await api.get('/api/clans/me');
  return res.data;
}

export async function createClan(name: string): Promise<Clan> {
  const res = await api.post('/api/clans', { name });
  return res.data;
}

export async function joinClan(code: string): Promise<Clan> {
  const res = await api.post('/api/clans/join', { code });
  return res.data;
}

export async function leaveClan(): Promise<void> {
  await api.delete('/api/clans/leave');
}
