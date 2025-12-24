import { createContext } from 'react';

interface UserData {
  uid: string;
  email: string | null;
  role: 'admin' | 'moderator' | 'user';
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
