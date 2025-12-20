import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Button } from '../components/ui';
import { format, subDays } from 'date-fns';
import { Loader2, Trash2, Undo, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TrashedPost {
  id: string;
  title: string;
  trashedAt: any;
}

export default function Trash() {
  const { isModerator, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trashedPosts, setTrashedPosts] = useState<TrashedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isModerator) {
      navigate('/');
    }
  }, [isModerator, authLoading, navigate]);

  const fetchTrashedPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'trashed'),
        orderBy('trashedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TrashedPost[];
      setTrashedPosts(posts);
    } catch (error) {
      console.error("Error fetching trashed posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModerator) {
      fetchTrashedPosts();
    }
  }, [isModerator]);

  const handleRestore = async (id: string) => {
    if (window.confirm("Are you sure you want to restore this post?")) {
      try {
        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, { status: 'draft', trashedAt: null });
        fetchTrashedPosts();
      } catch (error) {
        console.error("Error restoring post:", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this post? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        fetchTrashedPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm("Are you sure you want to permanently delete all posts in the trash? This action cannot be undone.")) {
      try {
        const q = query(collection(db, 'posts'), where('status', '==', 'trashed'));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        fetchTrashedPosts();
      } catch (error) {
        console.error("Error emptying trash:", error);
        alert("An error occurred while emptying the trash.");
      }
    }
  }

  useEffect(() => {
    const cleanupOldPosts = async () => {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const q = query(collection(db, 'posts'), where('status', '==', 'trashed'), where('trashedAt', '<=', thirtyDaysAgo));
        const oldPosts = await getDocs(q);
        const batch = writeBatch(db);
        oldPosts.docs.forEach(d => batch.delete(d.ref));
        if (!oldPosts.empty) {
          await batch.commit();
          fetchTrashedPosts();
        }
      } catch (error) {
        console.error("Error cleaning up old trashed posts:", error);
      }
    };
    if(isModerator) cleanupOldPosts();
  }, [isModerator]);


  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }

  if (!isModerator) {
    return (
        <div className="flex flex-col justify-center items-center h-[50vh] text-center">
            <ShieldAlert className="text-red-400 mb-4" size={48} />
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted mt-2">You do not have permission to view this page. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-surface">Trash</h1>
        <Button variant="destructive" onClick={handleEmptyTrash} disabled={trashedPosts.length === 0}>
          Empty Trash
        </Button>
      </div>

      <div className="bg-surface/5 rounded-lg overflow-hidden">
        <div className="flex items-center px-4 py-2 font-bold bg-surface/10 text-sm text-surface/80">
          <div className="flex-grow">Title</div>
          <div className="w-40 text-center">Trashed Date</div>
          <div className="w-32 text-center">Actions</div>
        </div>
        <div className="divide-y divide-surface/10">
          {trashedPosts.length > 0 ? (
            trashedPosts.map(post => (
              <div key={post.id} className="flex items-center px-4 py-3 group hover:bg-surface/10 transition-colors">
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-surface truncate">{post.title}</p>
                </div>
                <div className="w-40 text-center text-surface/80">
                  {post.trashedAt ? format(new Date(post.trashedAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                </div>
                <div className="w-32 flex justify-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleRestore(post.id)} title="Restore" className="h-8 w-8 text-green-400/70 hover:text-green-400">
                    <Undo size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="Delete Permanently" className="h-8 w-8 text-red-400/70 hover:text-red-400">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-surface/60 p-8 text-center">The trash is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
}
