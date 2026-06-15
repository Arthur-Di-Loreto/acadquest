import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getXpLog, XpLogEntry } from '../src/services/xpLogService';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function XpHistoryScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<XpLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getXpLog()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.back}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.title}>Histórico de XP</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#E94560" style={{ marginTop: 40 }} />
      ) : logs.length === 0 ? (
        <Text style={s.empty}>Nenhum XP registrado ainda.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.xp}>+{item.amount} XP</Text>
                <Text style={s.date}>{formatDate(item.createdAt)}</Text>
              </View>
              <Text style={s.reason}>{item.reason}</Text>
              {item.missionTitle ? (
                <Text style={s.mission}>{item.missionTitle}</Text>
              ) : null}
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
  empty: { color: '#aaa', textAlign: 'center', marginTop: 60, fontSize: 15 },
  card: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  xp: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  date: { color: '#888', fontSize: 12 },
  reason: { color: '#ddd', fontSize: 14 },
  mission: { color: '#aaa', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
});
