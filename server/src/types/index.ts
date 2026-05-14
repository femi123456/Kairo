import { Request } from 'express';
import { IUser } from '../models/User';
import { INote } from '../models/Note';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export { IUser, INote };
