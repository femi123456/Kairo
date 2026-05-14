export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  pageColor: string;
  paperStyle: string;
  fontFamily: string;
  noteWidth: string;
  isPublic: boolean;
  shareId: string | null;
  versions?: { body: string; savedAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
