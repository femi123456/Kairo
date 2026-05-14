import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-room', ({ userId }: { userId: string }) => {
      socket.join(userId);
    });

    socket.on('note-updated', ({ userId, note }: { userId: string; note: any }) => {
      socket.to(userId).emit('note-updated', { note });
    });

    socket.on('note-created', ({ userId, note }: { userId: string; note: any }) => {
      socket.to(userId).emit('note-created', { note });
    });

    socket.on('note-deleted', ({ userId, noteId }: { userId: string; noteId: string }) => {
      socket.to(userId).emit('note-deleted', { noteId });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
