import api from '../config/api';

export interface XpLogEntry {
  _id: string;
  amount: number;
  reason: string;
  missionTitle?: string;
  createdAt: string;
}

export async function getXpLog(): Promise<XpLogEntry[]> {
  const res = await api.get('/api/xp-log/me');
  return res.data.logs;
}
