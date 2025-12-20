import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { GlassPanel, Button, Input, Textarea } from '../components/ui';
import { ArrowLeft, Edit, Camera, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';

export default function Profile() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setBio(docSnap.data()?.bio || '');
        }
      });
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !auth.currentUser) return;
    setLoading(true);

    try {
      let newPhotoURL = auth.currentUser.photoURL;

      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        newPhotoURL = await getDownloadURL(avatarRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        photoURL: newPhotoURL,
        bio: bio,
      });
      
      alert('Profile updated successfully!');
      setIsEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }

  if (authLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center text-surface/60 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Home
      </Link>
      <GlassPanel className="p-8">
        <div className="flex justify-end mb-4">
            {!isEditMode ? (
                <Button variant="secondary" size="sm" onClick={() => setIsEditMode(true)}>
                    <Edit size={16} className="mr-2" /> Edit Profile
                </Button>
            ) : (
                 <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X size={16} className="mr-2" /> Cancel
                </Button>
            )}
        </div>

        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
                <img 
                    src={avatarPreview || currentUser.photoURL || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-full h-full rounded-full border-2 border-accent/50 object-cover"
                />
                {isEditMode && (
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full cursor-pointer text-white opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                        <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                )}
            </div>

            {!isEditMode ? (
              <>
                <h1 className="text-2xl font-bold text-white">{displayName || 'Anonymous User'}</h1>
                <p className="text-surface/60">{currentUser.email}</p>
                {bio && <p className="text-center mt-4 text-surface/80">{bio}</p>}
                <Button onClick={logout} className="mt-6">
                    Log Out
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                />
                <Textarea
                    label="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself..."
                    rows={4}
                />
                <div className="flex justify-end gap-4 mt-4">
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
              </div>
            )}
        </div>
      </GlassPanel>
    </div>
  );
}
