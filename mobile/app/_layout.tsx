import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebase';
import { useAuthStore } from '../src/store/useAuthStore';
import { getMe } from '../src/services/authService';

export default function RootLayout() {
  const { setFirebaseUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        try {
          const appUser = await getMe();
          setAppUser(appUser);
        } catch {
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
