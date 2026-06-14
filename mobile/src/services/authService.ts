import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  semester: number;
  course: string;
}

export async function register(payload: RegisterPayload): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

  await api.post('/api/auth/register', {
    name: payload.name,
    email: payload.email,
    semester: payload.semester,
    course: payload.course,
  });

  return credential;
}

export async function login(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  return signOut(auth);
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me');
  return data.user;
}
