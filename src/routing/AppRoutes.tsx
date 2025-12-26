
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminRoute from '../components/routes/AdminRoute';
import ProtectedRoute from '../components/routes/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Profile = lazy(() => import('../pages/Profile'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const PostListPage = lazy(() => import('../pages/PostListPage'));
const PostPage = lazy(() => import('../pages/PostPage'));
const JournalPage = lazy(() => import('../pages/JournalPage'));
const Trash = lazy(() => import('../pages/Trash'));
const Posts = lazy(() => import('../pages/admin/Posts'));
const PostEditPage = lazy(() => import('../pages/admin/PostEditPage'));

const AppRoutes = () => {
  return (
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
        <Route path="/admin/posts/editor" element={<AdminRoute><PostEditPage /></AdminRoute>} />
        <Route path="/admin/posts/editor/:slug" element={<AdminRoute><PostEditPage /></AdminRoute>} />
        <Route path="/admin/trash" element={<AdminRoute><Trash /></AdminRoute>} />
        
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
