import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { logout } from '../../src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const { appUser, reset } = useAuthStore();

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive', onPress: async () => {
          await logout();
          reset();
        },
      },
    ]);
  }

  if (!appUser) return null;

  const hp = appUser.hp ?? 100;
  const maxHp = appUser.maxHp ?? 100;
  const hpPercent = Math.max(0, Math.min((hp / maxHp) * 100, 100));
  const xpToNext = appUser.level * 100;
  const xpProgress = appUser.xp;
  const xpPercent = Math.min((xpProgress / xpToNext) * 100, 100);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Avatar e nome */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarLetter}>{appUser.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{appUser.name}</Text>
        <Text style={s.sub}>{appUser.course} · {appUser.semester}º semestre</Text>
        <View style={s.levelBadge}>
          <Text style={s.levelText}>Nível {appUser.level}</Text>
        </View>
      </View>

      {/* Status */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Status</Text>

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

        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{appUser.xp}</Text>
            <Text style={s.infoLabel}>XP Total</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{appUser.level}</Text>
            <Text style={s.infoLabel}>Nível</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{hp}</Text>
            <Text style={s.infoLabel}>HP</Text>
          </View>
        </View>
      </View>

      {/* Clã */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Clã</Text>
        {appUser.clan ? (
          <Text style={s.clanActive}>Você é membro de um clã</Text>
        ) : (
          <Text style={s.clanEmpty}>Você é um jogador solo. Em breve poderá criar ou entrar em um clã.</Text>
        )}
      </View>

      {/* Editar perfil */}
      <TouchableOpacity style={s.editBtn} onPress={() => router.push('/edit-profile')}>
        <Text style={s.editBtnText}>Editar perfil</Text>
      </TouchableOpacity>

      {/* Histórico de XP */}
      <TouchableOpacity style={s.historyBtn} onPress={() => router.push('/xp-history')}>
        <Text style={s.historyBtnText}>Histórico de XP</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  content: { padding: 20, paddingTop: 40, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  sub: { color: '#888', fontSize: 13, marginBottom: 10 },
  levelBadge: { backgroundColor: '#0F3460', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 },
  levelText: { color: '#E94560', fontWeight: 'bold', fontSize: 13 },

  card: {
    backgroundColor: '#16213E', borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#0F3460',
  },
  cardTitle: { color: '#aaa', fontSize: 12, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },

  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  statLabel: { color: '#666', fontSize: 11, fontWeight: '600', width: 20 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#0F3460', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  hpBar: { backgroundColor: '#E94560' },
  xpBar: { backgroundColor: '#4CAF50' },
  statValue: { color: '#888', fontSize: 11, width: 56, textAlign: 'right' },

  infoRow: { flexDirection: 'row', marginTop: 8, gap: 8 },
  infoBox: {
    flex: 1, backgroundColor: '#0F3460', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  infoValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  infoLabel: { color: '#888', fontSize: 11, marginTop: 2 },

  clanActive: { color: '#4CAF50', fontSize: 14 },
  clanEmpty: { color: '#666', fontSize: 13, lineHeight: 20 },

  editBtn: {
    backgroundColor: '#0F3460', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  historyBtn: {
    backgroundColor: '#16213E', borderRadius: 10, borderWidth: 1, borderColor: '#0F3460',
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  historyBtnText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#E94560', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: '#E94560', fontWeight: 'bold', fontSize: 15 },
});
