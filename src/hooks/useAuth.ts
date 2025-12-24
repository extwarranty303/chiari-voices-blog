import { useContext } from 'react';
import { AuthContext } from '../context/authContextTypes';
import type { AuthContextType } from '../context/authContextTypes';

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  logout: () => Promise.resolve(),
  isAdmin: false,
  isModerator: false,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
};
