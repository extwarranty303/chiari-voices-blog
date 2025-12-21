
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage, auth } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs, where, query, documentId } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { GlassPanel, Button } from '../components/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs } from '../components/Tabs';
import { ProfileForm, BookmarkedPosts, UserActivity, AccessibilitySettings } from '../components/profile';
import CVPlaceholder from '../assets/images/cv-placeholder.svg';

// ... interfaces remain the same ...

interface BookmarkedPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
}

interface UserData {
    firstName?: string;
    lastName?: string;
    bio?: string;
    bookmarkedPosts?: string[];
    isPublic?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  createdAt: Date;
}


export default function Profile() {
  const { user: authUser, loading: authLoading, logout } = useAuth(); // Assuming useAuth exposes a loading state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [memberSince, setMemberSince] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure auth state is determined and user object is available
    if (!authLoading && authUser && authUser.uid) {
      const userDocRef = doc(db, 'users', authUser.uid);

      if (auth.currentUser?.metadata?.creationTime) {
        setMemberSince(new Date(auth.currentUser.metadata.creationTime).getFullYear().toString());
      }

      // Fetch user profile data
      getDoc(userDocRef).then(async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserData;
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setBio(userData.bio || '');
          setIsPublic(userData.isPublic || false);

          if (userData.bookmarkedPosts && userData.bookmarkedPosts.length > 0) {
            const postsQuery = query(collection(db, 'posts'), where(documentId(), 'in', userData.bookmarkedPosts));
            const postsSnap = await getDocs(postsQuery);
            setBookmarkedPosts(postsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
          }
        }
      });

      // Fetch user comments
      const commentsQuery = query(collection(db, 'comments'), where('userId', '==', authUser.uid));
      getDocs(commentsQuery).then(async (commentsSnap) => {
        const comments = await Promise.all(commentsSnap.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          const postDoc = await getDoc(doc(db, 'posts', commentData.postId));
          return {
            id: commentDoc.id,
            postTitle: postDoc.data()?.title || 'Untitled Post',
            ...commentData,
          } as Comment;
        }));
        setUserComments(comments);
      });
      setIsLoading(false);
    } else if (!authLoading) {
        setIsLoading(false); // Stop loading if there's no user
    }
  }, [authUser, authLoading]);

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
      
      const newDisplayName = `${firstName} ${lastName}`.trim();

      await updateProfile(auth.currentUser, {
        displayName: newDisplayName,
        photoURL: newPhotoURL,
      });

      const userDocRef = doc(db, 'users', authUser.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        photoURL: newPhotoURL,
        bio,
        isPublic,
      });
      
      alert('Profile updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const tabs = [
    { label: 'Edit Profile', content: <ProfileForm 
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        bio={bio}
        setBio={setBio}
        isPublic={isPublic}
        setIsPublic={setIsPublic}
        setAvatarFile={setAvatarFile}
        avatarPreview={avatarPreview}
        setAvatarPreview={setAvatarPreview}
        handleSaveChanges={handleSaveChanges}
        isSaving={isSaving}
    /> },
    { label: 'Bookmarked Posts', content: <BookmarkedPosts posts={bookmarkedPosts} /> },
    { label: 'My Activity', content: <UserActivity comments={userComments} /> },
    { label: 'Accessibility', content: <AccessibilitySettings /> },
  ];

  if (isLoading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }
  
  if (!authUser) {
    return <div className="text-center p-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-surface/60 hover:text-accent mb-6 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>
        <GlassPanel className="p-8">
            <div className="flex items-start space-x-8">
                <div className="flex-shrink-0">
                    <img 
                        src={avatarPreview || authUser.photoURL || CVPlaceholder} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-2 border-accent/50 object-cover"
                    />
                </div>
                <div className="flex-grow">
                     <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{`${firstName} ${lastName}`.trim() || 'Anonymous User'}</h1>
                            <p className="text-surface/60">{authUser.email}</p>
                            {memberSince && <p className="text-sm text-surface/50 mt-1">Member since {memberSince}</p>}
                        </div>
                        <Button onClick={logout}>
                            Log Out
                        </Button>
                     </div>
                     <p className="mt-4 text-surface/80">{bio}</p>
                </div>
            </div>
            <div className="mt-8">
                <Tabs tabs={tabs} />
            </div>
        </GlassPanel>
    </div>
  );
}
