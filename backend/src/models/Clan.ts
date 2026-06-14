import { Schema, model, Document, Types } from 'mongoose';

export interface IClan extends Document {
  name: string;
  code: string;
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  hp: number;
  maxHp: number;
  course: string;
  semester: number;
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const clanSchema = new Schema<IClan>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, unique: true, default: generateCode },
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    hp: { type: Number, default: 500 },
    maxHp: { type: Number, default: 500 },
    course: { type: String, required: true },
    semester: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Clan = model<IClan>('Clan', clanSchema);
