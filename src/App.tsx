
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { SymptomSafeProvider } from './context/SymptomSafeContext';
import { FontProvider } from './context/FontContext';
import { useFont } from './hooks/useFont';
import { Header } from './components/layout';
import { FloatingAccessibilityMenu } from './components/layout/FloatingAccessibilityMenu';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PostListPage = lazy(() => import('./pages/PostListPage'));
const PostPage = lazy(() => import('./pages/PostPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const Trash = lazy(() => import('./pages/Trash'));
const Posts = lazy(() => import('./pages/admin/Posts'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isModerator } = useAuth();
  if (loading) return null;
  if (!user || (!isAdmin && !isModerator)) return <Navigate to="/" />;
  return <>{children}</>;
};

const AppContent = () => {
  const { isDyslexicFont } = useFont();

  useEffect(() => {
    if (isDyslexicFont) {
      document.body.classList.add('font-opendyslexic');
    } else {
      document.body.classList.remove('font-opendyslexic');
    }
  }, [isDyslexicFont]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-surface font-sans selection:bg-accent selection:text-white">
      <Header />
      <FloatingAccessibilityMenu />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:slug" element={<PostPage />} /> 
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/journal" 
              element={
                <ProtectedRoute>
                  <JournalPage />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><Posts /></AdminRoute>} />
            <Route path="/admin/trash" element={<AdminRoute><Trash /></AdminRoute>} />
            
            {/* Setup Route - Temporary */}
            <Route path="/setup-admin" element={<AdminSetup />} />
          </Routes>
        </Suspense>
      </main>
      
      <footer className="w-full py-8 mt-auto glass-panel">
        <div className="container mx-auto px-4 text-center text-surface/60 text-xs">
          <p className="mb-4">
            Disclaimer: The Chiari Voices Foundation does not provide medical advice. The information on this website is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <p>
            © 2025 The Chiari Voices Foundation. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SymptomSafeProvider>
        <FontProvider>
          <Router>
            <AppContent />
          </Router>
        </FontProvider>
      </SymptomSafeProvider>
    </AuthProvider>
  );
}

export default App;
