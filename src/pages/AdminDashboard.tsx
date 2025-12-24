import { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import PostEditor from '../components/PostEditor';
import PostPreview from '../components/PostPreview';
import { Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { Plus, Edit2, FileText, CheckCircle, Pencil, Flag, Loader2, ShieldAlert, Search, X, Trash2, Eye } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'trashed';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  publishedAt?: Timestamp;
  tags?: string[];
  imageUrl?: string;
  readTime?: number;
  authorName?: string;
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
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
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
    let filtered = nonTrashed;
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    if (selectedTags.length > 0) {
        filtered = filtered.filter(p => selectedTags.every(tag => p.tags?.includes(tag)));
    }
    
    return filtered;
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
    <div className="flex flex-col lg:flex-row gap-8 h-full relative">
      <div className={cn("w-full transition-all duration-300", showEditor ? "lg:w-1/3 hidden lg:block" : "w-full")}>
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-surface">Dashboard</h1>
                <Button onClick={handleNewPost} className="w-full md:w-auto"><Plus size={18} className="mr-2" /> New Post</Button>
            </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button onClick={() => setStatusFilter('all')} className={cn('text-left p-3 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'all' && 'border-accent')}>
                <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">Total</h3><FileText size={16} className="text-surface/60" /></div><p className="text-xl font-bold">{stats.totalPosts}</p>
            </button>
            <button onClick={() => setStatusFilter('published')} className={cn('text-left p-3 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'published' && 'border-accent')}>
                 <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">Live</h3><CheckCircle size={16} className="text-green-400" /></div><p className="text-xl font-bold">{stats.publishedPosts}</p>
            </button>
            <button onClick={() => setStatusFilter('draft')} className={cn('text-left p-3 rounded-xl bg-surface/5 border border-surface/10 transition-colors', statusFilter === 'draft' && 'border-accent')}>
                <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">Drafts</h3><Pencil size={16} className="text-yellow-400" /></div><p className="text-xl font-bold">{stats.draftPosts}</p>
            </button>
            <Link to="/admin/trash" className="block p-3 rounded-xl bg-surface/5 border border-surface/10 transition-colors hover:border-accent/70">
                <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">Trash</h3><Trash2 size={16} className="text-red-400" /></div><p className="text-xl font-bold">{stats.trashedPosts}</p>
            </Link>
            <Link to="/admin/comments" className="block p-3 rounded-xl bg-surface/5 border border-surface/10 transition-colors hover:border-accent/70">
                <div className="flex justify-between items-center mb-1"><h3 className="font-bold text-sm">Reported</h3><Flag size={16} className="text-red-400" /></div><p className="text-xl font-bold">{stats.reportedComments}</p>
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
            
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-surface/80 mr-2">Filter by tag:</span>
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
                </div>
            )}
            
            <div className="bg-surface/5 rounded-lg overflow-hidden border border-surface/10">
                {/* Table Header */}
                <div className="flex items-center px-4 py-3 font-bold bg-surface/10 text-[10px] uppercase tracking-widest text-surface/50 border-b border-surface/10">
                    <div className="flex-grow min-w-0">Title</div>
                    <div className="w-[100px] text-center hidden sm:block shrink-0">Status</div>
                    <div className="w-[100px] text-center hidden md:block shrink-0">Created</div>
                    <div className="w-[100px] text-center hidden lg:block shrink-0">Published</div>
                    <div className="w-[100px] text-center hidden xl:block shrink-0">Updated</div>
                    <div className="w-[100px] text-right shrink-0">Actions</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-surface/10">
                  {filteredPosts.length > 0 ? filteredPosts.map(post => (
                    <div key={post.id} className="flex items-center px-4 py-4 group hover:bg-surface/5 transition-colors">
                      {/* Title Column */}
                      <div className="flex-grow min-w-0 pr-4">
                        <p className="font-medium text-surface truncate group-hover:text-accent transition-colors">{post.title}</p>
                        {/* Mobile-only status indicator */}
                        <div className="sm:hidden mt-1 flex items-center gap-2">
                             <span className={cn(
                                'w-2 h-2 rounded-full',
                                post.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
                             )} />
                             <span className="text-[10px] text-surface/50 capitalize font-medium">{post.status}</span>
                        </div>
                      </div>
                      
                      {/* Status Column */}
                      <div className="w-[100px] flex justify-center hidden sm:flex shrink-0">
                         <span className={cn(
                           'px-2 py-0.5 text-[9px] uppercase tracking-tighter rounded-full font-bold border whitespace-nowrap',
                           post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                         )}>{post.status}</span>
                      </div>
                      
                      {/* Date Columns */}
                      <div className="w-[100px] text-center text-[11px] text-surface/60 hidden md:block shrink-0 font-mono">
                        {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      <div className="w-[100px] text-center text-[11px] text-surface/60 hidden lg:block shrink-0 font-mono">
                        {post.publishedAt?.seconds ? new Date(post.publishedAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      <div className="w-[100px] text-center text-[11px] text-surface/60 hidden xl:block shrink-0 font-mono">
                        {post.updatedAt?.seconds ? new Date(post.updatedAt.seconds * 1000).toLocaleDateString() : '-'}
                      </div>
                      
                      {/* Actions Column */}
                      <div className="w-[100px] flex justify-end gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewPost(post)} className="h-8 w-8 hover:bg-accent/20 hover:text-accent rounded-lg" title="Quick Preview"><Eye size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPost(post)} className="h-8 w-8 hover:bg-surface/20 rounded-lg" title="Edit Post"><Edit2 size={14} /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTrashPost(post.id)} className="h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg" title="Trash Post"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  )) : <div className="p-12 text-center text-surface/30 text-sm">No posts match your criteria.</div>}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
          "fixed top-0 right-0 h-full z-50 transition-transform duration-500 ease-in-out shadow-2xl",
          "w-full lg:w-2/3 bg-background/95 backdrop-blur-xl border-l border-surface/10 overflow-y-auto",
          showEditor ? "translate-x-0" : "translate-x-full"
      )}>
        {showEditor && (
            <PostEditor 
                post={selectedPost as any}
                onClose={handleEditorClose} 
            />
        )}
      </div>

      {previewPost && (
          <PostPreview 
            postData={{
                title: previewPost.title,
                content: previewPost.content,
                authorName: previewPost.authorName,
                createdAt: previewPost.createdAt,
                tags: previewPost.tags,
                readTime: previewPost.readTime,
                imageUrl: previewPost.imageUrl
            }}
            onClose={() => setPreviewPost(null)}
          />
      )}
    </div>
  );
}
