import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register, logout } from '../src/services/authService';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { reset } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !course || !semester) {
      Alert.alert('Preencha todos os campos.');
      return;
    }
    const sem = parseInt(semester, 10);
    if (isNaN(sem) || sem < 1 || sem > 10) {
      Alert.alert('Semestre inválido', 'Informe um número entre 1 e 10.');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email: email.trim(), password, course, semester: sem });
      // _layout.tsx cuida do redirect
    } catch (err: any) {
      const code = err?.code ?? '';
      const msg =
        code.includes('email-already-in-use')
          ? 'Este e-mail já está cadastrado.'
          : code.includes('weak-password')
          ? 'A senha deve ter pelo menos 6 caracteres.'
          : 'Erro ao cadastrar. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#1A1A2E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>Criar conta</Text>

        <TextInput style={s.input} placeholder="Nome completo" placeholderTextColor="#888" value={name} onChangeText={setName} />
        <TextInput style={s.input} placeholder="E-mail" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Senha (mín. 6 caracteres)" placeholderTextColor="#888" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={s.input} placeholder="Curso (ex: ADS, Engenharia)" placeholderTextColor="#888" value={course} onChangeText={setCourse} />
        <TextInput style={s.input} placeholder="Semestre (1–10)" placeholderTextColor="#888" value={semester} onChangeText={setSemester} keyboardType="numeric" />

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={async () => {
          await logout();
          reset();
          router.replace('/login');
        }}>
          <Text style={s.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#E94560', marginBottom: 32 },
  input: { width: '100%', backgroundColor: '#16213E', borderRadius: 10, padding: 14, marginBottom: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#0F3460' },
  btn: { width: '100%', backgroundColor: '#E94560', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#E94560', fontSize: 14 },
});
