import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPlayer, PublicPlayer } from '../../src/services/userService';

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<PublicPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPlayer(id)
      .then(setPlayer)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  if (error || !player) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Jogador não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hpPercent = Math.max(0, Math.min((player.hp / player.maxHp) * 100, 100));
  const xpToNext = player.level * 100;
  const xpPercent = Math.min((player.xp / xpToNext) * 100, 100);
  const total = player.stats.completed + player.stats.failed;
  const winRate = total > 0 ? Math.round((player.stats.completed / total) * 100) : 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={s.back}>← Voltar</Text>
      </TouchableOpacity>

      {/* Avatar e nome */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarLetter}>{player.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{player.name}</Text>
        <Text style={s.sub}>{player.course} · {player.semester}º semestre</Text>
        <View style={s.levelBadge}>
          <Text style={s.levelText}>Nível {player.level}</Text>
        </View>
      </View>

      {/* Barras de status */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Status</Text>

        <View style={s.statRow}>
          <Text style={s.statLabel}>HP</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, s.hpBar, { width: `${hpPercent}%` }]} />
          </View>
          <Text style={s.statValue}>{player.hp}/{player.maxHp}</Text>
        </View>

        <View style={s.statRow}>
          <Text style={s.statLabel}>XP</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, s.xpBar, { width: `${xpPercent}%` }]} />
          </View>
          <Text style={s.statValue}>{player.xp}/{xpToNext}</Text>
        </View>

        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{player.xp}</Text>
            <Text style={s.infoLabel}>XP</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{player.level}</Text>
            <Text style={s.infoLabel}>Nível</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{player.hp}</Text>
            <Text style={s.infoLabel}>HP</Text>
          </View>
        </View>
      </View>

      {/* Missões */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Missões</Text>
        <View style={s.infoRow}>
          <View style={s.infoBox}>
            <Text style={[s.infoValue, { color: '#4CAF50' }]}>{player.stats.completed}</Text>
            <Text style={s.infoLabel}>Concluídas</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={[s.infoValue, { color: '#E94560' }]}>{player.stats.failed}</Text>
            <Text style={s.infoLabel}>Falhadas</Text>
          </View>
          <View style={s.infoBox}>
            <Text style={s.infoValue}>{winRate}%</Text>
            <Text style={s.infoLabel}>Taxa de sucesso</Text>
          </View>
        </View>
      </View>

      {/* Clã */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Clã</Text>
        {player.clan ? (
          <>
            <Text style={s.clanName}>{player.clan.name}</Text>
            <View style={s.clanRow}>
              <Text style={s.clanDetail}>{player.clan.memberCount} membros</Text>
              <Text style={s.clanDetail}>HP {player.clan.hp}/{player.clan.maxHp}</Text>
            </View>
          </>
        ) : (
          <Text style={s.clanEmpty}>Jogador solo</Text>
        )}
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#aaa', fontSize: 16, marginBottom: 16 },
  backBtn: { backgroundColor: '#E94560', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },

  back: { color: '#E94560', fontSize: 14, marginBottom: 24 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E94560', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
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
  infoBox: { flex: 1, backgroundColor: '#0F3460', borderRadius: 10, padding: 12, alignItems: 'center' },
  infoValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  infoLabel: { color: '#888', fontSize: 11, marginTop: 2, textAlign: 'center' },

  clanName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  clanRow: { flexDirection: 'row', gap: 16 },
  clanDetail: { color: '#888', fontSize: 13 },
  clanEmpty: { color: '#666', fontSize: 13 },
});
