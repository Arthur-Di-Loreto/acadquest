import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { updateProfile } from '../src/services/authService';

export default function EditProfileScreen() {
  const router = useRouter();
  const { appUser, setAppUser } = useAuthStore();

  const [name, setName] = useState(appUser?.name ?? '');
  const [course, setCourse] = useState(appUser?.course ?? '');
  const [semester, setSemester] = useState(String(appUser?.semester ?? ''));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim() || !course.trim() || !semester) {
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
      const updated = await updateProfile({ name: name.trim(), course: course.trim(), semester: sem });
      setAppUser(updated);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#1A1A2E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={s.title}>Editar Perfil</Text>
        </View>

        <Text style={s.label}>Nome</Text>
        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="Seu nome completo" placeholderTextColor="#555" maxLength={60} />

        <Text style={s.label}>Curso</Text>
        <TextInput style={s.input} value={course} onChangeText={setCourse}
          placeholder="Ex: ADS, Engenharia" placeholderTextColor="#555" maxLength={60} />

        <Text style={s.label}>Semestre</Text>
        <TextInput style={s.input} value={semester} onChangeText={setSemester}
          placeholder="1 a 10" placeholderTextColor="#555" keyboardType="number-pad" maxLength={2} />

        <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Salvar alterações</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 28 },
  back: { color: '#E94560', fontSize: 14, marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#16213E', borderRadius: 10, padding: 13,
    color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#0F3460',
  },
  saveBtn: {
    backgroundColor: '#E94560', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
