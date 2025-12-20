import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, GlassPanel } from '../components/ui';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For signup
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to handle redirect based on role
  const handleRoleRedirect = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigate('/admin');
          return;
        }
      }
      navigate('/');
    } catch (error) {
      console.error("Error checking role:", error);
      navigate('/');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleRoleRedirect(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: 'user', // Default role
          createdAt: new Date().toISOString()
        });
        
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    setError('');
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        navigate('/');
      } else {
        await handleRoleRedirect(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassPanel className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {isLogin && (
            <div className="text-right -mb-2">
                <button 
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="text-sm text-surface/80 hover:text-accent hover:underline font-medium"
                >
                    Forgot Password?
                </button>
            </div>
          )}
          
          <Button type="submit" className="w-full !mt-6" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-[1px] bg-surface/10 flex-1" />
          <span className="text-sm text-surface/60">OR</span>
          <div className="h-[1px] bg-surface/10 flex-1" />
        </div>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full" onClick={() => handleSocialLogin(new GoogleAuthProvider())}>
            Continue with Google
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => handleSocialLogin(new FacebookAuthProvider())}>
            Continue with Facebook
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-surface/80">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMessage('');
            }}
            className="text-accent hover:text-accent/80 font-medium hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </GlassPanel>
    </div>
  );
}
