import { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import PostEditor from '../components/PostEditor';
import { Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { Plus, Edit2, FileText, CheckCircle, Pencil, Flag, Loader2, ShieldAlert, Search, X, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'trashed';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;
  tags?: string[];
}

interface Comment {
    id: string;
    reported?: boolean;
}

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  trashedPosts: number;
  totalComments: number;
  reportedComments: number;
}

export default function AdminDashboard() {
  const { user, isModerator, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'trashed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const canAccess = isModerator;

  useEffect(() => {
    if (!loading) {
      if (canAccess) {
        fetchData();
      } else {
        setTimeout(() => navigate('/'), 3000);
      }
    }
  }, [user, loading, canAccess, navigate]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const commentsQuery = collection(db, 'comments');
      
      const [postsSnapshot, commentsSnapshot] = await Promise.all([
        getDocs(postsQuery),
        getDocs(commentsQuery)
      ]);

      const fetchedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setPosts(fetchedPosts);
      setComments(commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleTrashPost = async (postId: string) => {
    if (window.confirm("Are you sure you want to move this post to the trash?")) {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          status: 'trashed',
          trashedAt: serverTimestamp(),
        });
        fetchData();
      } catch (error) {
        console.error("Error moving post to trash:", error);
        alert("An error occurred while moving the post to the trash.");
      }
    }
  };

  const handleNewPost = () => {
    setSelectedPost(null);
    setIsCreatingNew(true);
  };

  const handleEditPost = (post: Post) => {
    setIsCreatingNew(false);
    setSelectedPost(post);
  };

  const handleEditorClose = () => {
    setSelectedPost(null);
    setIsCreatingNew(false);
    fetchData();
  };

  const stats: DashboardStats = useMemo(() => ({
    totalPosts: posts.filter(p => p.status !== 'trashed').length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    draftPosts: posts.filter(p => p.status === 'draft').length,
    trashedPosts: posts.filter(p => p.status === 'trashed').length,
    totalComments: comments.length,
    reportedComments: comments.filter(c => c.reported).length,
  }), [posts, comments]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [posts]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredPosts = useMemo(() => {
    const nonTrashed = posts.filter(p => p.status !== 'trashed');
    if (statusFilter === 'all') return nonTrashed;
    return nonTrashed.filter(p => p.status === statusFilter)
      .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => selectedTags.length === 0 || selectedTags.every(tag => p.tags?.includes(tag)));
  }, [posts, statusFilter, searchTerm, selectedTags]);
  
  if (loading || (dataLoading && canAccess)) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }
  
  if (!canAccess) {
    return (
        <div className="flex flex-col justify-center items-center h-[50vh] text-center">
            <ShieldAlert className="text-red-400 mb-4" size={48} />
            <h1 className="text-3xl font-bold">Access Denied</h1>
            <p className="text-muted mt-2">You do not have permission to view this page. Redirecting...</p>
        </div>
    );
  }

  const showEditor = isCreatingNew || selectedPost !== null;

  return (
    <div className="flex gap-8 h-full">
      <div className={cn("w-full transition-all duration-300", showEditor ? "lg:w-1/3" : "w-full")}>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-surface">Dashboard</h1>
                <Button onClick={handleNewPost}><Plus size={18} /> New Post</Button>
            </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <button onClick={() => setStatusFilter('all')} className={cn('text-left p-4 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'all' && 'border-accent')}>
                <div className="flex justify-between items-center"><h3 className="font-bold">Total Posts</h3><FileText className="text-surface/60" /></div><p className="text-2xl font-bold">{stats.totalPosts}</p>
            </button>
            <button onClick={() => setStatusFilter('published')} className={cn('text-left p-4 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'published' && 'border-accent')}>
                 <div className="flex justify-between items-center"><h3 className="font-bold">Published</h3><CheckCircle className="text-green-400" /></div><p className="text-2xl font-bold">{stats.publishedPosts}</p>
            </button>
            <button onClick={() => setStatusFilter('draft')} className={cn('text-left p-4 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'draft' && 'border-accent')}>
                <div className="flex justify-between items-center"><h3 className="font-bold">Drafts</h3><Pencil className="text-yellow-400" /></div><p className="text-2xl font-bold">{stats.draftPosts}</p>
            </button>
            <Link to="/admin/trash" className="block p-4 rounded-xl bg-surface/5 border border-surface/10 transition-colors hover:border-accent/70">
                <div className="flex justify-between items-center"><h3 className="font-bold">Trash</h3><Trash2 className="text-red-400" /></div><p className="text-2xl font-bold">{stats.trashedPosts}</p>
            </Link>
            <Link to="/admin/comments" className="block p-4 rounded-xl bg-surface/5 border border-surface/10 transition-colors hover:border-accent/70">
                <div className="flex justify-between items-center"><h3 className="font-bold">Reported</h3><Flag className="text-red-400" /></div><p className="text-2xl font-bold">{stats.reportedComments}</p>
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-surface">All Posts</h2>
            <div className="flex gap-4">
                <div className="relative flex-grow">
                    <Input 
                        label="Search by title"
                        placeholder="Search by title..." 
                        value={searchTerm} 
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface/60" size={20}/>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-surface/80 mr-2">Filter by tag:</span>
              {allTags.length > 0 ? (
                <>
                  {allTags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => handleTagToggle(tag)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full transition-colors',
                        selectedTags.includes(tag) 
                          ? 'bg-accent text-background' 
                          : 'bg-surface/10 hover:bg-surface/20'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && 
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="flex items-center gap-1 text-accent"><X size={14}/>Clear</Button>
                  }
                </>
              ) : (
                <p className="text-sm text-surface/60">No tags found. Add tags to posts to enable filtering.</p>
              )}
            </div>
            
            <div className="bg-surface/5 rounded-lg overflow-hidden">
                <div className="flex items-center px-4 py-2 font-bold bg-surface/10 text-sm text-surface/80">
                    <div className="flex-grow">Title</div>
                    <div className="w-28 text-center">Status</div>
                    <div className="w-28 text-center">Created</div>
                    <div className="w-28 text-center">Published</div>
                    <div className="w-28 text-center">Updated</div>
                    <div className="w-32 text-center">Actions</div>
                </div>
                <div className="divide-y divide-surface/10">
                  {filteredPosts.length > 0 ? filteredPosts.map(post => (
                    <div key={post.id} className="flex items-center px-4 py-3 group hover:bg-surface/10 transition-colors">
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-surface truncate group-hover:underline">{post.title}</p>
                      </div>
                      <div className="w-28 text-center">
                         <span className={cn(
                           'px-2 py-1 text-xs rounded-full font-medium',
                           post.status === 'published' ? 'bg-green-400/10 text-green-300' : 'bg-yellow-400/10 text-yellow-300'
                         )}>{post.status}</span>
                      </div>
                      <div className="w-28 text-center text-xs text-surface/60">
                        {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      <div className="w-28 text-center text-xs text-surface/60">
                        {post.publishedAt?.seconds ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      <div className="w-28 text-center text-xs text-surface/60">
                        {post.updatedAt?.seconds ? new Date(post.updatedAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      <div className="w-32 flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)} className="h-8 w-8"><Edit2 size={16} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTrashPost(post.id)} className="h-8 w-8 text-red-400/70 hover:text-red-400"><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  )) : <p className="text-surface/60 p-4 text-center">No posts match your criteria.</p>}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
          "fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-in-out",
          "w-full lg:w-2/3 bg-background/80 backdrop-blur-xl border-l border-surface/10 overflow-y-auto",
          showEditor ? "translate-x-0" : "translate-x-full"
      )}>
        {showEditor && (
            <PostEditor 
                post={selectedPost as any}
                onClose={handleEditorClose} 
            />
        )}
      </div>
    </div>
  );
}
