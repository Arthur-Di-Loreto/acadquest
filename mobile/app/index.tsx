import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function IndexPage() {
  const router = useRouter();
  const { firebaseUser, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (firebaseUser) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, firebaseUser]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#E94560" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
