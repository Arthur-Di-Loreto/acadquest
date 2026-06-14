import { api } from './api';

export interface CreateClanPayload {
  name: string;
  description?: string;
  emblem?: string;
  semester: number;
  course: string;
}

export async function createClan(payload: CreateClanPayload) {
  const { data } = await api.post('/api/clans', payload);
  return data.clan;
}

export async function getClan(id: string) {
  const { data } = await api.get(`/api/clans/${id}`);
  return data.clan;
}

export async function joinClan(id: string) {
  const { data } = await api.post(`/api/clans/${id}/join`);
  return data.clan;
}

export async function leaveClan(id: string) {
  const { data } = await api.delete(`/api/clans/${id}/leave`);
  return data;
}
