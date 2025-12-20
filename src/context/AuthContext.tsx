import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
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

export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser: User | null) => {
      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'admin' | 'moderator' | 'user' = 'user';
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || 'user';
          } else {
            console.warn("User authenticated but no Firestore profile found. Defaulting to 'user'.");
          }

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role,
            displayName: authUser.displayName || '',
            photoURL: authUser.photoURL || ''
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: 'user',
            displayName: authUser.displayName || '',
            photoURL: authUser.photoURL || ''
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    logout,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
