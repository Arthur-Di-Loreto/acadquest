import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { getPlayerRanking, getClanRanking, PlayerRank, ClanRank } from '../../src/services/rankingService';

type Tab = 'players' | 'clans';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingScreen() {
  const [tab, setTab] = useState<Tab>('players');
  const [players, setPlayers] = useState<PlayerRank[]>([]);
  const [clans, setClans] = useState<ClanRank[]>([]);
  const [meta, setMeta] = useState<{ course: string; semester: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [pr, cr] = await Promise.all([getPlayerRanking(), getClanRanking()]);
      setPlayers(pr.players);
      setClans(cr.clans);
      setMeta({ course: pr.course, semester: pr.semester });
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Ranking</Text>
        {meta && <Text style={s.sub}>{meta.course} · {meta.semester}º semestre</Text>}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tabBtn, tab === 'players' && s.tabActive]} onPress={() => setTab('players')}>
          <Text style={[s.tabText, tab === 'players' && s.tabTextActive]}>Jogadores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tabBtn, tab === 'clans' && s.tabActive]} onPress={() => setTab('clans')}>
          <Text style={[s.tabText, tab === 'clans' && s.tabTextActive]}>Clãs</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#E94560" size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#E94560" />}
        >
          {tab === 'players' ? (
            players.length === 0
              ? <Text style={s.empty}>Nenhum jogador encontrado no seu curso e semestre.</Text>
              : players.map((p) => (
                <View key={p._id} style={[s.card, p.isMe && s.cardMe]}>
                  <Text style={s.position}>
                    {MEDAL[p.position] ?? `#${p.position}`}
                  </Text>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.info}>
                    <Text style={s.name}>{p.name}{p.isMe ? ' (você)' : ''}</Text>
                    <Text style={s.detail}>Nível {p.level} · {p.hp} HP</Text>
                  </View>
                  <Text style={s.xp}>{p.xp} XP</Text>
                </View>
              ))
          ) : (
            clans.length === 0
              ? <Text style={s.empty}>Nenhum clã encontrado no seu curso e semestre.</Text>
              : clans.map((c) => (
                <View key={c._id.toString()} style={[s.card, c.isMine && s.cardMe]}>
                  <Text style={s.position}>
                    {MEDAL[c.position] ?? `#${c.position}`}
                  </Text>
                  <View style={[s.avatar, s.clanAvatar]}>
                    <Text style={s.avatarText}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={s.info}>
                    <Text style={s.name}>{c.name}{c.isMine ? ' (seu clã)' : ''}</Text>
                    <Text style={s.detail}>{c.memberCount} membros · {c.hp}/{c.maxHp} HP</Text>
                  </View>
                  <Text style={s.xp}>{c.totalXp} XP</Text>
                </View>
              ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  header: { padding: 20, paddingTop: 40, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  sub: { color: '#666', fontSize: 13, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#16213E', borderRadius: 10, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#E94560' },
  tabText: { color: '#666', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 40 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213E', borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#0F3460',
  },
  cardMe: { borderColor: '#E94560', backgroundColor: '#1f1430' },
  position: { fontSize: 18, width: 36, textAlign: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clanAvatar: { backgroundColor: '#4CAF50' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 14, fontWeight: '600' },
  detail: { color: '#888', fontSize: 12, marginTop: 2 },
  xp: { color: '#4CAF50', fontWeight: 'bold', fontSize: 14 },
});
