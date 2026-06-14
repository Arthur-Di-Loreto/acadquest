import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables');

  await mongoose.connect(uri);
  console.log('[database] Connected to MongoDB');

  mongoose.connection.on('error', (err) => {
    console.error('[database] Connection error:', err);
  });
}
