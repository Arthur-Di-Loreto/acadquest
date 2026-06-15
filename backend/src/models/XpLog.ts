import { Schema, model, Document, Types } from 'mongoose';

export interface IXpLog extends Document {
  user: Types.ObjectId;
  amount: number;
  reason: string;
  missionTitle?: string;
  createdAt: Date;
}

const xpLogSchema = new Schema<IXpLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    missionTitle: { type: String },
  },
  { timestamps: true },
);

export const XpLog = model<IXpLog>('XpLog', xpLogSchema);
