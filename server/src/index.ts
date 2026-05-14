import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import notesRoutes from './routes/notesRoutes';
import aiRoutes from './routes/aiRoutes';
import { initSocket } from './lib/socket';
import { setIo } from './lib/socketInstance';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

setIo(io);
initSocket(io);

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in the environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Kairo server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

startServer();
