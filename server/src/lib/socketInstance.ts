import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIo = (io: Server) => {
  ioInstance = io;
};

export const getIo = (): Server | null => {
  return ioInstance;
};
