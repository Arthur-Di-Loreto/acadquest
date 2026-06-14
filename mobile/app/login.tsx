import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // _layout.tsx cuida do redirect
    } catch (err: any) {
      const code = err?.code ?? '';
      const msg =
        code.includes('invalid-credential') || code.includes('wrong-password')
          ? 'E-mail ou senha incorretos.'
          : code.includes('user-not-found')
          ? 'Nenhuma conta com este e-mail.'
          : code.includes('too-many-requests')
          ? 'Muitas tentativas. Tente mais tarde.'
          : 'Erro ao entrar. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>AcadQuest</Text>
      <Text style={s.sub}>Sua jornada acadêmica começa aqui</Text>

      <TextInput style={s.input} placeholder="E-mail" placeholderTextColor="#888"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <TextInput style={s.input} placeholder="Senha" placeholderTextColor="#888"
        value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.navigate('/register')}>
        <Text style={s.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#E94560', marginBottom: 8 },
  sub: { fontSize: 14, color: '#aaa', marginBottom: 40 },
  input: { width: '100%', backgroundColor: '#16213E', borderRadius: 10, padding: 14, marginBottom: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#0F3460' },
  btn: { width: '100%', backgroundColor: '#E94560', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#E94560', fontSize: 14 },
});
