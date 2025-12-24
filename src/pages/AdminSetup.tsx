import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui';

export default function AdminSetup() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const makeAdmin = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'admin',
        displayName: user.displayName,
        photoURL: user.photoURL
      }, { merge: true });
      setStatus('Success! You are now an admin. Please refresh the page to see changes.');
    } catch (error) {
        console.error(error);
      setStatus('Error: ' + (error as any).message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 text-white max-w-md mx-auto mt-10 bg-surface/5 rounded-lg border border-surface/10">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Access Setup</h1>
      
      {!user ? (
          <div className="text-center p-4 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">
              Please log in to use this tool.
          </div>
      ) : (
        <>
            <div className="space-y-4 mb-6">
                <div className="p-4 bg-surface/10 rounded">
                    <p className="text-sm text-surface/60 uppercase text-xs font-bold mb-1">Current User</p>
                    <p className="font-mono">{user.email}</p>
                </div>
                <div className="p-4 bg-surface/10 rounded">
                    <p className="text-sm text-surface/60 uppercase text-xs font-bold mb-1">Current Role</p>
                    <p className="font-mono capitalize">{user.role || 'none'}</p>
                </div>
            </div>

            <Button onClick={makeAdmin} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Promote Current User to Admin'}
            </Button>
            
            {status && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-center">
                    {status}
                </div>
            )}
        </>
      )}
    </div>
  );
}
