import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getClanRanking } from '../services/rankingService';

interface RankedClan {
  rank: number;
  _id: string;
  name: string;
  emblem?: string;
  xp: number;
  hp: number;
  maxHp: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const [ranking, setRanking] = useState<RankedClan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClanRanking()
      .then(setRanking)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking de Clãs</Text>
      <FlatList
        data={ranking}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.rank <= 3 && styles.topCard]}>
            <Text style={styles.rank}>{MEDALS[item.rank - 1] ?? `#${item.rank}`}</Text>
            <View style={styles.info}>
              <Text style={styles.clanName}>{item.name}</Text>
              <Text style={styles.xp}>{item.xp} XP</Text>
            </View>
            <View style={styles.hpContainer}>
              <Text style={styles.hpLabel}>HP</Text>
              <Text style={styles.hpValue}>
                {item.hp}/{item.maxHp}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  topCard: {
    borderColor: '#E94560',
  },
  rank: {
    fontSize: 22,
    width: 44,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  clanName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  xp: {
    color: '#E94560',
    fontSize: 12,
    marginTop: 2,
  },
  hpContainer: {
    alignItems: 'flex-end',
  },
  hpLabel: {
    color: '#888',
    fontSize: 11,
  },
  hpValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
