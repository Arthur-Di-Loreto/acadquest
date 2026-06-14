import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useClanStore } from '../../src/store/useClanStore';
import { logout } from '../../src/services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const { appUser, reset } = useAuthStore();
  const { setClan } = useClanStore();

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setClan(null);
          reset();
          router.replace('/login');
        },
      },
    ]);
  }

  if (!appUser) return null;

  const xpToNextLevel = appUser.level * 100;
  const progress = Math.min((appUser.xp % xpToNextLevel) / xpToNextLevel, 1);

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarLetter}>{appUser.name.charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.name}>{appUser.name}</Text>
      <Text style={styles.sub}>
        {appUser.course} · {appUser.semester}º semestre
      </Text>

      <View style={styles.levelRow}>
        <Text style={styles.levelLabel}>Nível {appUser.level}</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{appUser.xp} XP</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Encerrar sessão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E94560',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  levelRow: {
    width: '100%',
    marginBottom: 40,
  },
  levelLabel: {
    color: '#E94560',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  xpBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#16213E',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#E94560',
    borderRadius: 5,
  },
  xpLabel: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'right',
  },
  logoutButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E94560',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E94560',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
