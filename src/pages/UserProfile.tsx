
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GlassPanel } from '../components/ui';

const UserProfile: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>Please log in to see your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <GlassPanel className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-white">User Profile</h1>
            <div className="space-y-4">
                <p><strong className="text-surface/80">Name:</strong> {user.displayName}</p>
                <p><strong className="text-surface/80">Email:</strong> {user.email}</p>
                <p><strong className="text-surface/80">UID:</strong> {user.uid}</p>
            </div>
        </GlassPanel>
    </div>
  );
};

export default UserProfile;
