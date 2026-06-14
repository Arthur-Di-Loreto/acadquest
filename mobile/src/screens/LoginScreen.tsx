import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Erro ao entrar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>AcadQuest</Text>
      <Text style={styles.subtitle}>Sua jornada acadêmica começa aqui</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  button: {
    width: '100%',
    backgroundColor: '#E94560',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#E94560',
    fontSize: 14,
  },
});
