import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage, auth } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs, where, query, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { GlassPanel, Button, Input, Textarea } from '../components/ui';
import { ArrowLeft, Edit, Camera, X, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookmarkedPost {
    id: string;
    title: string;
    slug: string;
}

interface UserData {
    bio?: string;
    bookmarkedPosts?: string[];
}

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);

  useEffect(() => {
    if (authUser) {
      setDisplayName(authUser.displayName || '');
      const userDocRef = doc(db, 'users', authUser.uid);
      getDoc(userDocRef).then(async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserData;
          setBio(userData?.bio || '');
          if (userData?.bookmarkedPosts && userData.bookmarkedPosts.length > 0) {
            const postsQuery = query(collection(db, 'posts'), where(documentId(), 'in', userData.bookmarkedPosts));
            const postsSnap = await getDocs(postsQuery);
            const posts = postsSnap.docs.map(doc => ({ id: doc.id, title: (doc.data() as any).title, slug: (doc.data() as any).slug }));
            setBookmarkedPosts(posts);
          }
        }
      });
    }
  }, [authUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!authUser || !auth.currentUser) return;
    setIsSaving(true);

    try {
      let newPhotoURL = authUser.photoURL;

      if (avatarFile) {
        const avatarRef = ref(storage, `avatars/${authUser.uid}`);
        await uploadBytes(avatarRef, avatarFile);
        newPhotoURL = await getDownloadURL(avatarRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      const userDocRef = doc(db, 'users', authUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        photoURL: newPhotoURL,
        bio: bio,
      });
      
      alert('Profile updated successfully!');
      setIsEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      window.location.reload();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (authUser) {
      setDisplayName(authUser.displayName || '');
    }
  }

  if (!authUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
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
                        src={avatarPreview || authUser.photoURL || '/default-avatar.png'} 
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
                    <p className="text-surface/60">{authUser.email}</p>
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
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                  </div>
                )}
            </div>
          </GlassPanel>
      </div>
      
      <div className="mt-12 lg:mt-0">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Bookmark /> Bookmarked Stories</h2>
        <div className="space-y-4">
            {bookmarkedPosts.length > 0 ? bookmarkedPosts.map(post => (
                <Link to={`/posts/${post.slug}`} key={post.id}>
                    <GlassPanel className="p-4 hover:bg-surface/20 transition-colors">
                        <h3 className="font-medium text-white truncate">{post.title}</h3>
                    </GlassPanel>
                </Link>
            )) : (
                <p className="text-surface/60 text-sm">You haven't bookmarked any stories yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}
