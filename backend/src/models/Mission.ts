import { Schema, model, Document, Types } from 'mongoose';

export type MissionType = 'tcc' | 'integrador' | 'seminario' | 'artigo' | 'outro';
export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface IMission extends Document {
  title: string;
  description: string;
  type: MissionType;
  status: MissionStatus;
  xpReward: number;
  hpPenalty: number;
  deadline: Date;
  clan: Types.ObjectId;
  assignedTo: Types.ObjectId[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const missionSchema = new Schema<IMission>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['tcc', 'integrador', 'seminario', 'artigo', 'outro'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    xpReward: { type: Number, required: true, min: 0 },
    hpPenalty: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    clan: { type: Schema.Types.ObjectId, ref: 'Clan', required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const Mission = model<IMission>('Mission', missionSchema);
