import api from '../config/api';

export interface Mission {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  xpReward: number;
  hpPenalty: number;
  deadline: string;
  clan?: string;
}

export async function getMyMissions(): Promise<{ personal: Mission[]; clan: Mission[] }> {
  const res = await api.get('/api/missions/me');
  return res.data;
}

export async function createMission(data: {
  title: string;
  description: string;
  type: string;
  xpReward: number;
  hpPenalty: number;
  deadline: string;
  assignToClan: boolean;
}) {
  const res = await api.post('/api/missions', data);
  return res.data;
}

export async function completeMission(id: string) {
  const res = await api.patch(`/api/missions/${id}/complete`);
  return res.data;
}

export async function failMission(id: string) {
  const res = await api.patch(`/api/missions/${id}/fail`);
  return res.data;
}
