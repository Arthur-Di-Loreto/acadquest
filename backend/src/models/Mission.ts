import { Schema, model, Document, Types } from 'mongoose';

export type MissionType = 'tcc' | 'integrador' | 'seminario' | 'artigo' | 'outro';
export type MissionStatus = 'pending' | 'completed' | 'failed';

export interface IMission extends Document {
  title: string;
  description: string;
  type: MissionType;
  status: MissionStatus;
  xpReward: number;
  hpPenalty: number;
  deadline: Date;
  createdBy: Types.ObjectId;
  assignedTo: Types.ObjectId[];
  clan?: Types.ObjectId;
  completedAt?: Date;
}

const missionSchema = new Schema<IMission>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['tcc', 'integrador', 'seminario', 'artigo', 'outro'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    xpReward: { type: Number, default: 50 },
    hpPenalty: { type: Number, default: 10 },
    deadline: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    clan: { type: Schema.Types.ObjectId, ref: 'Clan', default: null },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const Mission = model<IMission>('Mission', missionSchema);
