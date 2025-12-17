import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, Footer } from './components/layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  if (!currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, isAdmin, isModerator } = useAuth();
  if (loading) return null;
  if (!currentUser || (!isAdmin && !isModerator)) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-surface font-sans selection:bg-accent selection:text-white">
           <Header />
           <main className="flex-grow container mx-auto px-4 py-8">
             <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/login" element={<Login />} />
               
               {/* Public Blog Routes */}
               <Route path="/blog" element={<BlogList />} />
               <Route path="/blog/:id" element={<BlogPost />} />
               
               {/* Protected Routes */}
               <Route path="/profile" element={
                 <ProtectedRoute>
                   <Profile />
                 </ProtectedRoute>
               } />
               
               {/* Admin Routes */}
               <Route path="/admin" element={
                 <AdminRoute>
                   <AdminDashboard />
                 </AdminRoute>
               } />
             </Routes>
           </main>
           
           {/* Divider */}
           <div className="container mx-auto px-4">
            <hr className="border-t border-surface/10" />
           </div>

           <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
