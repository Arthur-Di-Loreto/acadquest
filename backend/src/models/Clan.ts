import { Schema, model, Document, Types } from 'mongoose';

export interface IClan extends Document {
  name: string;
  description?: string;
  emblem?: string;
  hp: number;
  maxHp: number;
  xp: number;
  members: Types.ObjectId[];
  leader: Types.ObjectId;
  semester: number;
  course: string;
  createdAt: Date;
  updatedAt: Date;
}

const clanSchema = new Schema<IClan>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    emblem: { type: String },
    hp: { type: Number, default: 100, min: 0 },
    maxHp: { type: Number, default: 100 },
    xp: { type: Number, default: 0, min: 0 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true, min: 1, max: 10 },
    course: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Clan = model<IClan>('Clan', clanSchema);
