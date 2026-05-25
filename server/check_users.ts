import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to DB');
    const users = await User.find({}, 'name email');
    console.log('Registered Users:');
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

check();
