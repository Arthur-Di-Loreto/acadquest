import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useClanStore } from '../../src/store/useClanStore';
import { getClan, leaveClan } from '../../src/services/clanService';
import { logout } from '../../src/services/authService';
import { useRouter } from 'expo-router';

export default function ClanScreen() {
  const router = useRouter();
  const { appUser, reset } = useAuthStore();
  const { clan, setClan } = useClanStore();
  const [loading, setLoading] = useState(!clan && !!appUser?.clan);

  useEffect(() => {
    if (appUser?.clan && !clan) {
      getClan(appUser.clan)
        .then(setClan)
        .finally(() => setLoading(false));
    }
  }, [appUser?.clan]);

  async function handleLeave() {
    if (!appUser?.clan) return;
    Alert.alert('Sair do clã', 'Tem certeza? Você perderá o vínculo com o clã.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveClan(appUser.clan!);
            setClan(null);
          } catch (err) {
            Alert.alert('Erro', err instanceof Error ? err.message : 'Tente novamente.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#E94560" size="large" />
      </View>
    );
  }

  if (!clan) {
    return (
      <View style={styles.center}>
        <Text style={styles.noClanText}>Você não pertence a um clã.</Text>
        <Text style={styles.noClanSub}>
          Use o código de convite de um clã para entrar, ou crie o seu!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{clan.name}</Text>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{clan.xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {clan.hp}/{clan.maxHp}
          </Text>
          <Text style={styles.statLabel}>HP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{clan.members.length}</Text>
          <Text style={styles.statLabel}>Membros</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Membros</Text>
      {clan.members.map((member) => (
        <View key={member._id} style={styles.memberCard}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberXp}>{member.xp} XP · Lv.{member.level}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
        <Text style={styles.leaveText}>Sair do Clã</Text>
      </TouchableOpacity>
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
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E94560',
    marginBottom: 20,
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#16213E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  memberXp: {
    color: '#888',
    fontSize: 12,
  },
  leaveButton: {
    marginTop: 24,
    marginBottom: 40,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E94560',
    alignItems: 'center',
  },
  leaveText: {
    color: '#E94560',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noClanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noClanSub: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});
