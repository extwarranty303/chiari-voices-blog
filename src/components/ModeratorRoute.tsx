import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContextTypes';
import type { ReactNode } from 'react';

const ModeratorRoute = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <Navigate to="/login" />;
  }

  const { user, loading, isModerator } = authContext;

  if (loading) {
    return <div>Loading...</div>;
  }

  return user && isModerator ? children : <Navigate to="/login" />;
};

export default ModeratorRoute;
