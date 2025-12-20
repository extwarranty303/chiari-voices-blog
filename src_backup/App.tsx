import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, Footer } from './components/layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminComments from './pages/AdminComments'; // Import the new page
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

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
               
               <Route path="/blog" element={<BlogList />} />
               <Route path="/blog/:slug" element={<BlogPost />} /> 
               
               <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
               
               {/* Admin Routes */}
               <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
               <Route path="/admin/comments" element={<AdminRoute><AdminComments /></AdminRoute>} />

             </Routes>
           </main>
           
           <div className="container mx-auto px-4"><hr className="border-t border-surface/10" /></div>
           <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
