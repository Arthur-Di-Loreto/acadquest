import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getMyMissions, completeMission, failMission, Mission } from '../../src/services/missionService';
import { getMe } from '../../src/services/authService';

const TYPE_LABEL: Record<string, string> = {
  tcc: 'TCC', integrador: 'Integrador', seminario: 'Seminário', artigo: 'Artigo', outro: 'Outro',
};

export default function HomeScreen() {
  const router = useRouter();
  const { appUser, setAppUser } = useAuthStore();
  const [personal, setPersonal] = useState<Mission[]>([]);
  const [clan, setClan] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, profile] = await Promise.all([getMyMissions(), getMe()]);
      setPersonal(data.personal);
      setClan(data.clan);
      setAppUser(profile);
    } catch {
      // mantém dados anteriores
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!appUser) return null;

  const hp = appUser.hp ?? 100;
  const maxHp = appUser.maxHp ?? 100;
  const hpPercent = Math.max(0, Math.min((hp / maxHp) * 100, 100));
  const xpToNext = appUser.level * 100;
  const xpProgress = appUser.xp % xpToNext;
  const xpPercent = Math.min((xpProgress / xpToNext) * 100, 100);

  const active = (list: Mission[]) => list.filter((m) => m.status === 'pending');
  const done = [...personal, ...clan].filter((m) => m.status !== 'pending');

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#E94560" />}
    >
      {/* Card do jogador */}
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>{appUser.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={s.playerInfo}>
            <Text style={s.playerName}>{appUser.name}</Text>
            <Text style={s.playerSub}>Nível {appUser.level} · {appUser.clan ? 'Membro de Clã' : 'Jogador Solo'}</Text>
            <Text style={s.playerCourse}>{appUser.course} · {appUser.semester}º semestre</Text>
          </View>
          <View style={s.xpBadge}>
            <Text style={s.xpBadgeText}>{appUser.xp}</Text>
            <Text style={s.xpBadgeLabel}>XP</Text>
          </View>
        </View>
        <View style={s.statRow}>
          <Text style={s.statLabel}>HP</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, s.hpBar, { width: `${hpPercent}%` }]} />
          </View>
          <Text style={s.statValue}>{hp}/{maxHp}</Text>
        </View>
        <View style={s.statRow}>
          <Text style={s.statLabel}>XP</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, s.xpBar, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={s.statValue}>{xpProgress}/{xpToNext}</Text>
        </View>
      </View>

      {/* Botão criar missão */}
      <TouchableOpacity style={s.createBtn} onPress={() => router.push('/create-mission')}>
        <Text style={s.createBtnText}>+ Criar Missão</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#E94560" style={{ marginTop: 32 }} />
      ) : (
        <>
          {/* Missões pessoais */}
          <Text style={s.section}>Minhas Missões</Text>
          {active(personal).length === 0
            ? <Text style={s.empty}>Nenhuma missão ativa. Crie uma!</Text>
            : active(personal).map((m) => (
                <MissionCard key={m._id} mission={m} onUpdate={load} />
              ))}

          {/* Missões do clã */}
          {appUser.clan && (
            <>
              <Text style={s.section}>Missões do Clã</Text>
              {active(clan).length === 0
                ? <Text style={s.empty}>Nenhuma missão de clã ativa.</Text>
                : active(clan).map((m) => (
                    <MissionCard key={m._id} mission={m} isClan onUpdate={load} />
                  ))}
            </>
          )}

          {/* Histórico */}
          {done.length > 0 && (
            <>
              <Text style={s.section}>Histórico</Text>
              {done.map((m) => <MissionCard key={m._id} mission={m} readOnly onUpdate={load} />)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function MissionCard({ mission, isClan = false, readOnly = false, onUpdate }: {
  mission: Mission; isClan?: boolean; readOnly?: boolean; onUpdate: () => void;
}) {
  const [acting, setActing] = useState(false);

  async function handle(action: 'complete' | 'fail') {
    setActing(true);
    try {
      if (action === 'complete') await completeMission(mission._id);
      else await failMission(mission._id);
      onUpdate();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a missão.');
    } finally {
      setActing(false);
    }
  }

  const deadline = new Date(mission.deadline);
  const overdue = mission.status === 'pending' && deadline < new Date();

  return (
    <View style={[s.missionCard, isClan && s.missionCardClan, mission.status === 'completed' && s.missionCardDone, mission.status === 'failed' && s.missionCardFailed]}>
      <View style={s.missionTop}>
        <View style={s.missionTags}>
          <Text style={s.typeTag}>{TYPE_LABEL[mission.type] ?? mission.type}</Text>
          {isClan && <Text style={s.clanTag}>CLÃ</Text>}
        </View>
        <Text style={[s.statusDot, { color: mission.status === 'completed' ? '#4CAF50' : mission.status === 'failed' ? '#E94560' : '#888' }]}>●</Text>
      </View>
      <Text style={s.missionTitle}>{mission.title}</Text>
      <Text style={s.missionDesc} numberOfLines={2}>{mission.description}</Text>
      <View style={s.missionFooter}>
        <Text style={[s.deadline, overdue && s.deadlineOverdue]}>
          {overdue ? '⚠ ' : ''}{deadline.toLocaleDateString('pt-BR')}
        </Text>
        <Text style={s.xpReward}>+{mission.xpReward} XP</Text>
      </View>
      {!readOnly && mission.status === 'pending' && (
        <View style={s.actions}>
          <TouchableOpacity style={[s.actionBtn, s.completeBtn]} onPress={() => handle('complete')} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.actionText}>Concluir</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.failBtn]} onPress={() => handle('fail')} disabled={acting}>
            <Text style={s.actionText}>Falhou</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  content: { padding: 16, paddingTop: 20, paddingBottom: 40 },

  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#0F3460' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarLetter: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  playerInfo: { flex: 1 },
  playerName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  playerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  playerCourse: { color: '#666', fontSize: 11, marginTop: 1 },
  xpBadge: { backgroundColor: '#0F3460', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  xpBadgeText: { color: '#E94560', fontWeight: 'bold', fontSize: 14 },
  xpBadgeLabel: { color: '#888', fontSize: 10 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  statLabel: { color: '#666', fontSize: 11, fontWeight: '600', width: 20 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#0F3460', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  hpBar: { backgroundColor: '#E94560' },
  xpBar: { backgroundColor: '#4CAF50' },
  statValue: { color: '#888', fontSize: 11, width: 56, textAlign: 'right' },

  createBtn: { backgroundColor: '#E94560', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  section: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 10, marginTop: 4 },
  empty: { color: '#555', fontSize: 13, marginBottom: 16 },

  missionCard: { backgroundColor: '#16213E', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#E94560' },
  missionCardClan: { borderLeftColor: '#4CAF50' },
  missionCardDone: { opacity: 0.7, borderLeftColor: '#2196F3' },
  missionCardFailed: { opacity: 0.7 },
  missionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  missionTags: { flexDirection: 'row', gap: 6 },
  typeTag: { color: '#E94560', fontSize: 10, fontWeight: 'bold', backgroundColor: '#0F3460', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  clanTag: { color: '#4CAF50', fontSize: 10, fontWeight: 'bold', backgroundColor: '#0a2010', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusDot: { fontSize: 12 },
  missionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  missionDesc: { color: '#888', fontSize: 12, marginBottom: 8, lineHeight: 17 },
  missionFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  deadline: { color: '#888', fontSize: 11 },
  deadlineOverdue: { color: '#E94560' },
  xpReward: { color: '#4CAF50', fontSize: 11, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  completeBtn: { backgroundColor: '#4CAF50' },
  failBtn: { backgroundColor: '#333', borderWidth: 1, borderColor: '#E94560' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
