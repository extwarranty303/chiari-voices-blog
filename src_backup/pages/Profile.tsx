import { useAuth } from '../context/AuthContext';
import { GlassPanel, Button } from '../components/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center text-surface/60 hover:text-accent mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>
        <GlassPanel className="p-8">
            <div className="flex flex-col items-center">
                <img 
                    src={currentUser.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full mb-4 border-2 border-accent/50"
                />
                <h1 className="text-2xl font-bold text-white">{currentUser.displayName || 'Anonymous User'}</h1>
                <p className="text-surface/60">{currentUser.email}</p>
                <Button onClick={logout} className="mt-6">
                    Log Out
                </Button>
            </div>
        </GlassPanel>
    </div>
  );
}
