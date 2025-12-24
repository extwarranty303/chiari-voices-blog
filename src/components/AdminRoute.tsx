import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading Auth Context...</div>;
  }
  
  console.log("AdminRoute Check:", { user, isAdmin });

  if (!user) {
      console.log("AdminRoute: No user, redirecting to login");
      return <Navigate to="/login" />;
  }

  if (!isAdmin) {
      console.log("AdminRoute: User is not admin, redirecting to home");
      return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AdminRoute;
