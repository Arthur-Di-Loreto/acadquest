import { api } from './api';

export async function getClanRanking(params?: { semester?: number; course?: string }) {
  const { data } = await api.get('/api/ranking/clans', { params });
  return data.ranking;
}

export async function getUserRanking(params?: { semester?: number; course?: string }) {
  const { data } = await api.get('/api/ranking/users', { params });
  return data.ranking;
}
