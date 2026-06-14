import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !course || !semester) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    const semesterNum = parseInt(semester, 10);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 10) {
      Alert.alert('Semestre inválido', 'Informe um semestre entre 1 e 10.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email: email.trim(), password, course, semester: semesterNum });
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Erro ao cadastrar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1A1A2E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Criar conta</Text>

        {[
          { placeholder: 'Nome completo', value: name, setter: setName },
          { placeholder: 'E-mail', value: email, setter: setEmail, keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
          { placeholder: 'Senha (mín. 6 caracteres)', value: password, setter: setPassword, secureTextEntry: true },
          { placeholder: 'Curso (ex: ADS, Engenharia)', value: course, setter: setCourse },
          { placeholder: 'Semestre (1–10)', value: semester, setter: setSemester, keyboardType: 'numeric' as const },
        ].map((field) => (
          <TextInput
            key={field.placeholder}
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor="#888"
            value={field.value}
            onChangeText={field.setter}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            secureTextEntry={field.secureTextEntry}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E94560',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
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
    marginTop: 8,
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
