import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  clan?: Types.ObjectId;
  semester: number;
  course: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    clan: { type: Schema.Types.ObjectId, ref: 'Clan' },
    semester: { type: Number, required: true, min: 1, max: 10 },
    course: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
