import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';

const migrate = async () => {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
    console.log('Connected.');
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { email: 'admin@cms.com' },
      { $set: { name: 'Aryan Sharma', email: 'aryansharma@ricr.in' } }
    );
    
    console.log(`Updated admin user: ${result.modifiedCount} modified.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
