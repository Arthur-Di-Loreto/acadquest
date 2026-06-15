import { Schema, model, Document, Types } from 'mongoose';

export interface IUserAchievement extends Document {
  user: Types.ObjectId;
  key: string;
  unlockedAt: Date;
}

const userAchievementSchema = new Schema<IUserAchievement>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
});

userAchievementSchema.index({ user: 1, key: 1 }, { unique: true });

export const UserAchievement = model<IUserAchievement>('UserAchievement', userAchievementSchema);
