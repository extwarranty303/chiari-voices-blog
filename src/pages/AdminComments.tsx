import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { Button, GlassPanel } from '../components/ui';
import { Check, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  text: string;
  authorName: string;
  createdAt: any;
  postId: string;
  slug: string;
  reported: boolean;
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'reported' | 'all'>('reported');

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    let q = query(commentsRef, orderBy('createdAt', 'desc'));

    if (filter === 'reported') {
      q = query(commentsRef, where('reported', '==', true), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, 'comments', id), { reported: false });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this comment?")) {
      await deleteDoc(doc(db, 'comments', id));
    }
  };

  return (
    <div className="space-y-8">
      <Link to="/admin" className="inline-flex items-center text-surface/60 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-white">Comment Moderation</h1>

      <div className="flex gap-2 border-b border-surface/10">
        <button 
          onClick={() => setFilter('reported')}
          className={`px-4 py-2 text-sm font-medium ${filter === 'reported' ? 'border-b-2 border-accent text-white' : 'text-surface/60 hover:text-white'}`}
        >
          Pending Review
        </button>
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'border-b-2 border-accent text-white' : 'text-surface/60 hover:text-white'}`}
        >
          All Comments
        </button>
      </div>

      <GlassPanel>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-surface/60 py-12">No comments to display in this category.</p>
        ) : (
          <div className="divide-y divide-surface/10">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <p className="text-surface/80">{comment.text}</p>
                  <div className="text-xs text-surface/50 mt-2">
                    <span>By: {comment.authorName}</span> | <span>{formatDistanceToNow(new Date(comment.createdAt?.seconds * 1000), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/blog/${comment.slug || comment.postId}`} target="_blank">
                      <ExternalLink size={14} /> View Post
                    </Link>
                  </Button>
                  {comment.reported && (
                    <Button onClick={() => handleApprove(comment.id)} variant="secondary" size="sm" className="bg-green-500/10 text-green-400">
                      <Check size={14} /> Approve
                    </Button>
                  )}
                  <Button onClick={() => handleDelete(comment.id)} variant="ghost" size="sm" className="text-red-400">
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
