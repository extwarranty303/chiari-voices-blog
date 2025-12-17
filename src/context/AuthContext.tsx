import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  role: 'admin' | 'moderator' | 'user';
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user role from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'admin' | 'moderator' | 'user' = 'user';
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || 'user';
          } else {
            console.warn("User authenticated but no Firestore profile found. Defaulting to 'user'.");
          }

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role,
            displayName: user.displayName || '',
            photoURL: user.photoURL || ''
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Still set the user, just with default role, so they aren't locked out entirely
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: 'user',
            displayName: user.displayName || '',
            photoURL: user.photoURL || ''
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isModerator: currentUser?.role === 'moderator' || currentUser?.role === 'admin' // Admin is also a mod effectively
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
