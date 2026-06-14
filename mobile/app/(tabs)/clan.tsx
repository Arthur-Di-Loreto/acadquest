import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getMyClan, createClan, joinClan, leaveClan, Clan } from '../../src/services/clanService';
import { getMe } from '../../src/services/authService';

export default function ClanScreen() {
  const { appUser, setAppUser } = useAuthStore();
  const [clan, setClan] = useState<Clan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clanName, setClanName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [acting, setActing] = useState(false);
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');

  async function load() {
    try {
      if (appUser?.clan) {
        const data = await getMyClan();
        setClan(data);
      } else {
        setClan(null);
      }
    } catch {
      setClan(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [appUser?.clan]);

  async function refreshUser() {
    const profile = await getMe();
    setAppUser(profile);
  }

  async function handleCreate() {
    if (!clanName.trim()) { Alert.alert('Informe o nome do clã.'); return; }
    setActing(true);
    try {
      await createClan(clanName.trim());
      await refreshUser();
      setClanName('');
      setView('menu');
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.error ?? 'Não foi possível criar o clã.');
    } finally {
      setActing(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { Alert.alert('Informe o código do clã.'); return; }
    setActing(true);
    try {
      await joinClan(joinCode.trim());
      await refreshUser();
      setJoinCode('');
      setView('menu');
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.error ?? 'Código inválido ou clã não encontrado.');
    } finally {
      setActing(false);
    }
  }

  async function handleLeave() {
    Alert.alert('Sair do clã', 'Tem certeza que deseja sair do clã?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          setActing(true);
          try {
            await leaveClan();
            await refreshUser();
            setClan(null);
          } catch {
            Alert.alert('Erro', 'Não foi possível sair do clã.');
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  // Usuário já tem clã
  if (appUser?.clan && clan) {
    const hpPercent = Math.max(0, Math.min((clan.hp / clan.maxHp) * 100, 100));
    const isLeader = clan.leader === appUser._id;

    return (
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#E94560" />}
      >
        <Text style={s.pageTitle}>Meu Clã</Text>

        <View style={s.card}>
          <View style={s.clanHeader}>
            <View>
              <Text style={s.clanName}>{clan.name}</Text>
              <Text style={s.clanSub}>{clan.course} · {clan.semester}º semestre</Text>
            </View>
            {isLeader && <View style={s.leaderBadge}><Text style={s.leaderText}>Líder</Text></View>}
          </View>

          <View style={s.codeBox}>
            <Text style={s.codeLabel}>Código do clã</Text>
            <Text style={s.codeValue}>{clan.code}</Text>
            <Text style={s.codeHint}>Compartilhe com seus colegas para entrarem</Text>
          </View>

          <Text style={s.hpLabel}>HP do Clã</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: `${hpPercent}%` }]} />
          </View>
          <Text style={s.hpValue}>{clan.hp}/{clan.maxHp}</Text>
        </View>

        <Text style={s.section}>Membros ({clan.members.length})</Text>
        {clan.members.map((m) => (
          <View key={m._id} style={s.memberCard}>
            <View style={s.memberAvatar}>
              <Text style={s.memberAvatarText}>{m.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.memberInfo}>
              <Text style={s.memberName}>{m.name}</Text>
              <Text style={s.memberSub}>Nível {m.level} · {m.hp} HP</Text>
            </View>
            <Text style={s.memberXp}>{m.xp} XP</Text>
          </View>
        ))}

        <TouchableOpacity style={s.leaveBtn} onPress={handleLeave} disabled={acting}>
          <Text style={s.leaveText}>Sair do clã</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Usuário sem clã
  if (view === 'create') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => setView('menu')}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={s.pageTitle}>Criar Clã</Text>
          <Text style={s.label}>Nome do clã</Text>
          <TextInput style={s.input} placeholder="Ex: Os Integradores"
            placeholderTextColor="#555" value={clanName} onChangeText={setClanName} maxLength={40} />
          <TouchableOpacity style={s.primaryBtn} onPress={handleCreate} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Criar Clã</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (view === 'join') {
    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => setView('menu')}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={s.pageTitle}>Entrar em um Clã</Text>
          <Text style={s.label}>Código do clã</Text>
          <TextInput style={s.input} placeholder="Ex: AB12CD"
            placeholderTextColor="#555" value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())} maxLength={6}
            autoCapitalize="characters" />
          <TouchableOpacity style={s.primaryBtn} onPress={handleJoin} disabled={acting}>
            {acting ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryBtnText}>Entrar</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.pageTitle}>Clã</Text>
        <Text style={s.emptyText}>Você ainda não faz parte de nenhum clã.</Text>

        <TouchableOpacity style={s.primaryBtn} onPress={() => setView('create')}>
          <Text style={s.primaryBtnText}>Criar um Clã</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.secondaryBtn} onPress={() => setView('join')}>
          <Text style={s.secondaryBtnText}>Entrar com Código</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  content: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },

  pageTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  back: { color: '#E94560', fontSize: 14, marginBottom: 16 },

  card: { backgroundColor: '#16213E', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#0F3460' },
  clanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  clanName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  clanSub: { color: '#888', fontSize: 12, marginTop: 2 },
  leaderBadge: { backgroundColor: '#E94560', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  leaderText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  codeBox: { backgroundColor: '#0F3460', borderRadius: 10, padding: 12, marginBottom: 16, alignItems: 'center' },
  codeLabel: { color: '#888', fontSize: 11, marginBottom: 4 },
  codeValue: { color: '#E94560', fontSize: 26, fontWeight: 'bold', letterSpacing: 4 },
  codeHint: { color: '#666', fontSize: 11, marginTop: 4 },

  hpLabel: { color: '#aaa', fontSize: 12, marginBottom: 6 },
  barTrack: { height: 10, backgroundColor: '#0F3460', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  barFill: { height: '100%', borderRadius: 5, backgroundColor: '#E94560' },
  hpValue: { color: '#888', fontSize: 12, textAlign: 'right' },

  section: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  memberCard: { backgroundColor: '#16213E', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#0F3460' },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  memberInfo: { flex: 1 },
  memberName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  memberSub: { color: '#888', fontSize: 12, marginTop: 2 },
  memberXp: { color: '#4CAF50', fontSize: 13, fontWeight: 'bold' },

  leaveBtn: { borderWidth: 1, borderColor: '#E94560', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  leaveText: { color: '#E94560', fontWeight: 'bold', fontSize: 14 },

  emptyText: { color: '#666', fontSize: 14, marginBottom: 32, lineHeight: 22 },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#16213E', borderRadius: 10, padding: 13, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#0F3460', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#E94560', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { borderWidth: 1, borderColor: '#E94560', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#E94560', fontWeight: 'bold', fontSize: 16 },
});
