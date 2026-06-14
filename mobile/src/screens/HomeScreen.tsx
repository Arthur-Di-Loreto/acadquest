import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useClanStore } from '../store/useClanStore';
import { getClan } from '../services/clanService';
import { getClanMissions } from '../services/missionService';

interface Mission {
  _id: string;
  title: string;
  type: string;
  status: string;
  xpReward: number;
  hpPenalty: number;
  deadline: string;
}

const MISSION_TYPE_LABELS: Record<string, string> = {
  tcc: 'TCC',
  integrador: 'Proj. Integrador',
  seminario: 'Seminário',
  artigo: 'Artigo',
  outro: 'Outro',
};

export default function HomeScreen() {
  const { appUser } = useAuthStore();
  const { clan, setClan } = useClanStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!appUser?.clan) {
        setLoading(false);
        return;
      }
      try {
        const [clanData, missionsData] = await Promise.all([
          getClan(appUser.clan),
          getClanMissions(appUser.clan),
        ]);
        setClan(clanData);
        setMissions(missionsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appUser?.clan]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Olá, {appUser?.name?.split(' ')[0]}!</Text>

      {clan ? (
        <>
          <View style={styles.clanCard}>
            <Text style={styles.clanName}>{clan.name}</Text>
            <View style={styles.hpRow}>
              <Text style={styles.hpLabel}>HP do Clã</Text>
              <View style={styles.hpBar}>
                <View style={[styles.hpFill, { width: `${(clan.hp / clan.maxHp) * 100}%` }]} />
              </View>
              <Text style={styles.hpText}>
                {clan.hp}/{clan.maxHp}
              </Text>
            </View>
            <Text style={styles.xpText}>{clan.xp} XP total</Text>
          </View>

          <Text style={styles.sectionTitle}>Missões Ativas</Text>
          {missions.filter((m) => m.status !== 'completed' && m.status !== 'failed').length === 0 ? (
            <Text style={styles.empty}>Nenhuma missão ativa.</Text>
          ) : (
            missions
              .filter((m) => m.status !== 'completed' && m.status !== 'failed')
              .map((mission) => (
                <View key={mission._id} style={styles.missionCard}>
                  <View style={styles.missionHeader}>
                    <Text style={styles.missionType}>
                      {MISSION_TYPE_LABELS[mission.type] ?? mission.type}
                    </Text>
                    <Text style={styles.missionXp}>+{mission.xpReward} XP</Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <Text style={styles.missionDeadline}>
                    Prazo: {new Date(mission.deadline).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              ))
          )}
        </>
      ) : (
        <View style={styles.noClan}>
          <Text style={styles.noClanText}>Você ainda não pertence a um clã.</Text>
          <Text style={styles.noClanSub}>Crie ou entre em um clã para começar sua jornada!</Text>
        </View>
      )}
    </ScrollView>
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
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
  },
  clanCard: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  clanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E94560',
    marginBottom: 12,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hpLabel: {
    color: '#aaa',
    fontSize: 12,
    width: 60,
  },
  hpBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#0F3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
    backgroundColor: '#E94560',
    borderRadius: 4,
  },
  hpText: {
    color: '#fff',
    fontSize: 12,
    width: 50,
    textAlign: 'right',
  },
  xpText: {
    color: '#aaa',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  missionCard: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E94560',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  missionType: {
    color: '#E94560',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  missionXp: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: 'bold',
  },
  missionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  missionDeadline: {
    color: '#888',
    fontSize: 12,
  },
  empty: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  noClan: {
    alignItems: 'center',
    marginTop: 60,
  },
  noClanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noClanSub: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});
