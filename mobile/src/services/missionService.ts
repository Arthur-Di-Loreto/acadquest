import { api } from './api';

export interface CreateMissionPayload {
  title: string;
  description: string;
  type: 'tcc' | 'integrador' | 'seminario' | 'artigo' | 'outro';
  xpReward: number;
  hpPenalty: number;
  deadline: string;
  clanId: string;
  assignedTo?: string[];
}

export async function createMission(payload: CreateMissionPayload) {
  const { data } = await api.post('/api/missions', payload);
  return data.mission;
}

export async function getClanMissions(clanId: string) {
  const { data } = await api.get(`/api/missions/clan/${clanId}`);
  return data.missions;
}

export async function completeMission(id: string) {
  const { data } = await api.patch(`/api/missions/${id}/complete`);
  return data.mission;
}

export async function failMission(id: string) {
  const { data } = await api.patch(`/api/missions/${id}/fail`);
  return data;
}
