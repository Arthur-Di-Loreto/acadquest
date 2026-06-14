import { IUser } from '../models/User';

// Sobe de nível enquanto o XP total atingir o limiar: nivel * 100
// Nível 1→2: 100 XP | Nível 2→3: 200 XP | Nível 3→4: 300 XP ...
export function applyLevelUp(user: IUser): boolean {
  let leveled = false;

  while (user.xp >= user.level * 100) {
    user.xp -= user.level * 100; // consome o XP do nível atual
    user.level += 1;
    user.maxHp += 20;
    user.hp = Math.min(user.hp + 20, user.maxHp); // cura 20 HP ao subir de nível
    leveled = true;
  }

  return leveled;
}
