import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';
import { AppUser } from '../store/useAuthStore';

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  semester: number;
  course: string;
}) {
  await createUserWithEmailAndPassword(auth, data.email, data.password);
  await api.post('/api/auth/register', {
    name: data.name,
    email: data.email,
    semester: data.semester,
    course: data.course,
  });
}

export async function getMe(): Promise<AppUser> {
  const res = await api.get('/api/auth/me');
  return res.data;
}

export async function logout() {
  await signOut(auth);
}
