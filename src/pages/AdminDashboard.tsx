import { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { GlassPanel, Button, cn } from '../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, Edit2, FileText, CheckCircle, Pencil, Flag } from 'lucide-react';

const PostEditor = lazy(() => import('../components/PostEditor'));

interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: any;
}

interface Comment {
    id: string;
    reported?: boolean;
}

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  reportedComments: number;
}

export default function AdminDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchData();
    }
  }, [currentUser, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const commentsQuery = collection(db, 'comments');
      
      const [postsSnapshot, commentsSnapshot] = await Promise.all([
        getDocs(postsQuery),
        getDocs(commentsQuery)
      ]);

      setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
      setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setIsEditing(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setEditingPost(null);
    fetchData();
  };

  const stats: DashboardStats = useMemo(() => ({
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
    totalComments: comments.length,
    reportedComments: comments.filter(c => c.reported).length,
  }), [posts, comments]);

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter(p => p.status === filter);
  }, [posts, filter]);
  
  if (authLoading || loading) {
    return <div className="text-center p-8 text-surface/60">Loading Dashboard...</div>;
  }

  if (isEditing) {
    return (
      <Suspense fallback={<div className="text-center p-8 text-surface/60">Loading Editor...</div>}>
        <PostEditor post={editingPost} onClose={handleCloseEditor} />
      </Suspense>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Button onClick={handleNewPost}><Plus size={18} /> New Post</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => setFilter('all')} className={cn('text-left transition-transform duration-200 hover:-translate-y-1', filter === 'all' && 'ring-2 ring-accent rounded-xl')}>
            <Card><CardHeader><CardTitle>Total Posts</CardTitle><FileText className="text-surface/60" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{stats.totalPosts}</div></CardContent></Card>
        </button>
        <button onClick={() => setFilter('published')} className={cn('text-left transition-transform duration-200 hover:-translate-y-1', filter === 'published' && 'ring-2 ring-accent rounded-xl')}>
            <Card><CardHeader><CardTitle>Published</CardTitle><CheckCircle className="text-green-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{stats.publishedPosts}</div></CardContent></Card>
        </button>
        <button onClick={() => setFilter('draft')} className={cn('text-left transition-transform duration-200 hover:-translate-y-1', filter === 'draft' && 'ring-2 ring-accent rounded-xl')}>
            <Card><CardHeader><CardTitle>Drafts</CardTitle><Pencil className="text-yellow-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{stats.draftPosts}</div></CardContent></Card>
        </button>
        <Link to="/admin/comments" className="transition-transform duration-200 hover:-translate-y-1">
            <Card><CardHeader><CardTitle>Reported Comments</CardTitle><Flag className="text-red-400" /></CardHeader><CardContent><div className="text-2xl font-bold text-white">{stats.reportedComments}</div></CardContent></Card>
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4 capitalize">{filter} Posts</h2>
        <div className="grid gap-4">
          {filteredPosts.length > 0 ? filteredPosts.map(post => (
            <GlassPanel key={post.id} className="flex items-center gap-6 p-6 group">
              <div className="min-w-0 flex-grow">
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full mb-2 ${post.status === 'published' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>{post.status}</span>
                <h3 className="font-medium text-white truncate group-hover:underline">{post.title}</h3>
              </div>
              <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}><Edit2 size={16} /></Button>
              </div>
            </GlassPanel>
          )) : <p className="text-surface/60">No posts to display in this category.</p>}
        </div>
      </div>
    </div>
  );
}
