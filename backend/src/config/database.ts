import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(uri, {
    dbName: 'memed',
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB connected successfully');
};