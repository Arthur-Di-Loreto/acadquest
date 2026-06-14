import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/config/firebase';
import { useAuthStore } from '../src/store/useAuthStore';
import { getMe } from '../src/services/authService';

export default function RootLayout() {
  const { firebaseUser, appUser, isLoading, setFirebaseUser, setAppUser, setLoading } = useAuthStore();
  const [needsProfile, setNeedsProfile] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await getMe();
          setAppUser(profile);
          setNeedsProfile(false);
        } catch {
          setAppUser(null);
          setNeedsProfile(true);
        }
      } else {
        setAppUser(null);
        setNeedsProfile(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'login';
    const inRegister = segments[0] === 'register';

    const inIndex = !segments[0] || segments[0] === 'index';

    if (!firebaseUser && !inLogin && !inRegister) {
      // Não autenticado fora das telas de auth → vai para login
      router.replace('/login');
    } else if (firebaseUser && needsProfile && !inRegister) {
      // Firebase ok mas sem perfil no MongoDB → vai para cadastro
      router.replace('/register');
    } else if (firebaseUser && appUser && (inLogin || inRegister || inIndex)) {
      // Autenticado com perfil e ainda em tela de auth → vai para home
      router.replace('/(tabs)/home');
    }
  }, [firebaseUser, appUser, isLoading, needsProfile, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-mission" />
    </Stack>
  );
}
