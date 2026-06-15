import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getMyAchievements, Achievement } from '../src/services/achievementService';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AchievementsScreen() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAchievements()
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.title}>Conquistas</Text>
        {!loading && (
          <Text style={s.counter}>{unlocked}/{achievements.length} desbloqueadas</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#E94560" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.key}
          numColumns={1}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={[s.card, !item.unlocked && s.cardLocked]}>
              <Text style={[s.icon, !item.unlocked && s.iconLocked]}>
                {item.unlocked ? item.icon : '🔒'}
              </Text>
              <View style={s.info}>
                <Text style={[s.label, !item.unlocked && s.labelLocked]}>{item.label}</Text>
                <Text style={[s.description, !item.unlocked && s.descriptionLocked]}>
                  {item.description}
                </Text>
                {item.unlocked && item.unlockedAt ? (
                  <Text style={s.date}>Desbloqueada em {formatDate(item.unlockedAt)}</Text>
                ) : null}
              </View>
              {item.unlocked && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>✓</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  back: { color: '#E94560', fontSize: 14, marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  counter: { color: '#888', fontSize: 13, marginTop: 4 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213E', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#4CAF50', gap: 14,
  },
  cardLocked: { borderColor: '#1e2a3a', backgroundColor: '#111827' },

  icon: { fontSize: 32, width: 42, textAlign: 'center' },
  iconLocked: { fontSize: 24 },

  info: { flex: 1 },
  label: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  labelLocked: { color: '#aaa' },
  description: { color: '#888', fontSize: 12 },
  descriptionLocked: { color: '#555' },
  date: { color: '#4CAF50', fontSize: 11, marginTop: 4 },

  badge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
