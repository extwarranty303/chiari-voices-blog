import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassPanel, Button, Input } from '../components/ui';
import { User, Camera, Loader2, Save } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || currentUser.displayName || '');
            setBio(data.bio || '');
            setPhotoURL(data.photoURL || currentUser.photoURL || '');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
    
    setLoading(true);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      
      // Auto-save the new image URL to firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: url
      });
      
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        bio,
        updatedAt: new Date().toISOString()
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Profile</h1>
      
      <div className="grid gap-6">
        <GlassPanel className="flex flex-col items-center p-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface/10 bg-surface/5 flex items-center justify-center">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-surface/40" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
              <Camera className="text-white" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
            </label>
          </div>
          <p className="mt-4 text-surface/60 text-sm">Click to change profile picture</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium uppercase tracking-wide">
            {currentUser?.role || 'User'}
          </div>
        </GlassPanel>

        <GlassPanel>
          {message.text && (
            <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Display Name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="How should we address you?"
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface/80">Bio</label>
                <textarea 
                  className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all min-h-[120px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="pt-2">
                 <label className="text-sm font-medium text-surface/80">Email (Cannot be changed)</label>
                 <div className="mt-1 px-4 py-2 rounded-lg bg-surface/5 text-surface/50 cursor-not-allowed">
                   {currentUser?.email}
                 </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                Save Changes
              </Button>
            </div>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
