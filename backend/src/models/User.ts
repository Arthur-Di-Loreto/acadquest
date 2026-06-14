import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  clan?: Types.ObjectId;
  semester: number;
  course: string;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    hp: { type: Number, default: 100 },
    maxHp: { type: Number, default: 100 },
    clan: { type: Schema.Types.ObjectId, ref: 'Clan', default: null },
    semester: { type: Number, required: true },
    course: { type: String, required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
