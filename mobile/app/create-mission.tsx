import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { createMission } from '../src/services/missionService';

const TYPES = [
  { key: 'tcc', label: 'TCC' },
  { key: 'integrador', label: 'Integrador' },
  { key: 'seminario', label: 'Seminário' },
  { key: 'artigo', label: 'Artigo' },
  { key: 'outro', label: 'Outro' },
] as const;

type MissionType = (typeof TYPES)[number]['key'];

function formatDeadline(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function CreateMissionScreen() {
  const router = useRouter();
  const { appUser } = useAuthStore();

  const inClan = !!appUser?.clan;
  // XP é fixo em 25 para missões de clã
  const fixedXp = 25;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MissionType>('outro');
  const [xpReward, setXpReward] = useState('50');
  const [hpPenalty, setHpPenalty] = useState('10');
  const [deadline, setDeadline] = useState('');
  const [assignToClan, setAssignToClan] = useState(false);
  const [loading, setLoading] = useState(false);

  const effectiveXp = inClan ? fixedXp : (parseInt(xpReward) || 50);

  async function handleCreate() {
    if (!title.trim() || !description.trim() || !deadline.trim()) {
      Alert.alert('Preencha título, descrição e prazo.');
      return;
    }

    const parts = deadline.split('/');
    if (parts.length !== 3 || parts[2].length !== 4) {
      Alert.alert('Data inválida', 'Use o formato DD/MM/AAAA.');
      return;
    }
    const [d, m, y] = parts;
    const parsed = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T23:59:00.000Z`);
    if (isNaN(parsed.getTime())) {
      Alert.alert('Data inválida', 'Verifique o formato DD/MM/AAAA.');
      return;
    }

    setLoading(true);
    try {
      await createMission({
        title: title.trim(),
        description: description.trim(),
        type,
        xpReward: effectiveXp,
        hpPenalty: parseInt(hpPenalty) || 10,
        deadline: parsed.toISOString(),
        assignToClan: inClan && assignToClan,
      });
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a missão.');
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
          <Text style={s.title}>Nova Missão</Text>
        </View>

        <Text style={s.label}>Título</Text>
        <TextInput style={s.input} placeholder="Ex: Entregar capítulo do TCC"
          placeholderTextColor="#555" value={title} onChangeText={setTitle} maxLength={100} />

        <Text style={s.label}>Descrição</Text>
        <TextInput style={[s.input, s.textarea]} placeholder="O que precisa ser feito..."
          placeholderTextColor="#555" value={description} onChangeText={setDescription}
          multiline numberOfLines={3} maxLength={500} />

        <Text style={s.label}>Tipo</Text>
        <View style={s.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity key={t.key}
              style={[s.chip, type === t.key && s.chipActive]}
              onPress={() => setType(t.key)}>
              <Text style={[s.chipText, type === t.key && s.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.row}>
          {/* XP: fixo em 25 se estiver em clã */}
          <View style={{ flex: 1 }}>
            <Text style={s.label}>XP de recompensa</Text>
            {inClan ? (
              <View style={[s.input, s.inputLocked]}>
                <Text style={s.lockedText}>25 (fixo para clãs)</Text>
              </View>
            ) : (
              <TextInput style={s.input} value={xpReward} onChangeText={setXpReward}
                keyboardType="number-pad" placeholderTextColor="#555" />
            )}
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Penalidade HP</Text>
            <TextInput style={s.input} value={hpPenalty} onChangeText={setHpPenalty}
              keyboardType="number-pad" placeholderTextColor="#555" />
          </View>
        </View>

        <Text style={s.label}>Prazo</Text>
        <TextInput
          style={s.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#555"
          value={deadline}
          onChangeText={(text) => setDeadline(formatDeadline(text))}
          keyboardType="number-pad"
          maxLength={10}
        />

        {inClan && (
          <TouchableOpacity style={s.toggleRow} onPress={() => setAssignToClan(!assignToClan)}>
            <View style={[s.toggle, assignToClan && s.toggleOn]}>
              <View style={[s.thumb, assignToClan && s.thumbOn]} />
            </View>
            <Text style={s.toggleLabel}>
              {assignToClan ? 'Missão do Clã (todos os membros)' : 'Missão Pessoal (só para mim)'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.submitBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Criar Missão</Text>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  back: { color: '#E94560', fontSize: 14, marginBottom: 8 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  label: { color: '#aaa', fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#16213E', borderRadius: 10, padding: 13,
    color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#0F3460',
  },
  inputLocked: {
    justifyContent: 'center',
    opacity: 0.6,
  },
  lockedText: { color: '#888', fontSize: 14 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#16213E', borderWidth: 1, borderColor: '#0F3460',
  },
  chipActive: { backgroundColor: '#E94560', borderColor: '#E94560' },
  chipText: { color: '#666', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 12 },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: '#0F3460', justifyContent: 'center', paddingHorizontal: 3,
  },
  toggleOn: { backgroundColor: '#4CAF50', alignItems: 'flex-end' },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  thumbOn: {},
  toggleLabel: { color: '#ccc', fontSize: 14, flex: 1 },
  submitBtn: {
    backgroundColor: '#E94560', borderRadius: 10,
    paddingVertical: 16, alignItems: 'center', marginTop: 28,
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
