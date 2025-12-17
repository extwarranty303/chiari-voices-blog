import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, setDoc, updateDoc, doc, serverTimestamp, getDocs, deleteDoc, query, orderBy, where, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassPanel, Button, Input } from '../components/ui';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Clock, Tags, Star, Lightbulb } from 'lucide-react';

const Editor = lazy(() => import('../components/Editor'));

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  imageUrl?: string;
  readTime?: string;
  status: 'draft' | 'published';
  featured?: boolean;
  createdAt: any;
  authorId: string;
}

export default function AdminDashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [postImage, setPostImage] = useState<string>('');
  const [readTime, setReadTime] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  const [showAiIdeas, setShowAiIdeas] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && currentUser) {
        fetchPosts();
    }
  }, [currentUser, authLoading]);

  const fetchPosts = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setLoading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPostImage(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));
  
  const runAiHelper = async (type: 'readTime' | 'tags' | 'ideas') => {
    setAiLoading(true);
    try {
      const blogAiHelper = httpsCallable(functions, 'blogAiHelper');
      const result: any = await blogAiHelper({ 
        type, 
        content: content, 
        topic: ideaTopic 
      });

      if (result.data.readTime) setReadTime(result.data.readTime);
      if (result.data.tags) setTags([...new Set([...tags, ...result.data.tags])]);
      if (result.data.ideas) setGeneratedIdeas(result.data.ideas);
      
    } catch (error) {
      console.error(`AI Helper Error (${type}):`, error);
      alert("The AI helper failed. Please ensure Cloud Functions are deployed and running.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!currentUser || !title.trim()) return alert("Title is required.");
    setLoading(true);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const excerpt = plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');

    const postData = { title, content, excerpt, tags, imageUrl: postImage, readTime, status: publish ? 'published' : 'draft', authorId: currentUser.uid, authorName: currentUser.displayName || 'Anonymous', updatedAt: serverTimestamp() };

    try {
      if (currentPostId) {
        await updateDoc(doc(db, 'posts', currentPostId), postData);
      } else {
        const newPostRef = doc(collection(db, 'posts'));
        await setDoc(newPostRef, { ...postData, createdAt: serverTimestamp(), featured: false });
        setCurrentPostId(newPostRef.id);
      }
      alert(`Post ${publish ? 'published' : 'saved'} successfully!`);
      if (publish) {
        resetForm();
        setIsEditing(false);
      }
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (postToFeature: BlogPost) => {
    setLoading(true);
    const batch = writeBatch(db);
    const featuredQuery = query(collection(db, 'posts'), where('featured', '==', true));
    const featuredSnapshot = await getDocs(featuredQuery);
    featuredSnapshot.forEach(doc => batch.update(doc.ref, { featured: false }));
    if (!postToFeature.featured) batch.update(doc(db, 'posts', postToFeature.id), { featured: true });
    try {
      await batch.commit();
      fetchPosts();
    } catch (error) {
      console.error("Error toggling featured status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags || []);
    setPostImage(post.imageUrl || '');
    setReadTime(post.readTime || '');
    setStatus(post.status);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This is irreversible.")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const resetForm = () => {
    setCurrentPostId(null); setTitle(''); setContent(''); setTags([]); setPostImage(''); setReadTime(''); setStatus('draft');
  };

  if (authLoading) return <div className="text-center p-8">Loading...</div>;
  if (!currentUser?.role?.match(/admin|moderator/)) return <div className="text-center py-20"><h2 className="text-2xl font-bold text-white">Access Denied</h2><p className="text-surface/60 mt-2">You do not have permission to view this page.</p></div>;

  return (
    <div className="space-y-8">
      {!isEditing && <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-white">Blog Management</h1><Button onClick={() => { setIsEditing(true); resetForm(); }}><Plus size={18} /> New Post</Button></div>}
      
      {isEditing ? (
        <GlassPanel><form onSubmit={(e) => { e.preventDefault(); handleSave(true); }} className="space-y-6"><div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">{currentPostId ? 'Edit Post' : 'Create New Post'}</h2><Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); resetForm(); }}><X size={18} /> Close</Button></div><div className="grid md:grid-cols-3 gap-6"><div className="md:col-span-2 space-y-4"><div className="flex gap-2 flex-wrap pb-2"><Button type="button" size="sm" variant="secondary" onClick={() => setShowAiIdeas(!showAiIdeas)}><Lightbulb size={14} /> AI Ideas</Button><Button type="button" size="sm" variant="secondary" onClick={() => runAiHelper('readTime')} disabled={aiLoading || !content}><Clock size={14} /> Gen Read Time</Button><Button type="button" size="sm" variant="secondary" onClick={() => runAiHelper('tags')} disabled={aiLoading || !content}><Tags size={14} /> Gen Tags</Button></div>

                {showAiIdeas && (
                  <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                    <div className="flex gap-2 mb-3">
                      <Input placeholder="Enter a topic..." value={ideaTopic} onChange={(e) => setIdeaTopic(e.target.value)} className="bg-black/20" />
                      <Button type="button" onClick={() => runAiHelper('ideas')} disabled={aiLoading || !ideaTopic}>{aiLoading ? '...' : 'Go'}</Button>
                    </div>
                    {generatedIdeas.length > 0 && <ul className="space-y-2">{generatedIdeas.map((idea, idx) => <li key={idx} className="flex items-center justify-between text-sm text-surface/80 bg-black/20 p-2 rounded">{idea}<button type="button" onClick={() => { setTitle(idea); setShowAiIdeas(false); }} className="text-accent hover:text-white text-xs font-bold">Use</button></li>)}</ul>}
                  </div>
                )}
                
                <Input label="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a catchy title..." required />
                <div className="space-y-1.5"><label className="text-sm font-medium text-surface/80">Content</label><Suspense fallback={<div>Loading Editor...</div>}><Editor value={content} onChange={setContent} /></Suspense></div>
              </div>

              <div className="space-y-6">
                <Input label="Read Time" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="e.g. 5 min read" />
                <div className="space-y-2"><label className="text-sm font-medium text-surface/80">Cover Image</label><div className="relative h-40 rounded-lg border-2 border-dashed border-surface/20 flex items-center justify-center overflow-hidden hover:bg-surface/5">{postImage ? <><img src={postImage} alt="Cover" className="w-full h-full object-cover" /><button type="button" onClick={() => setPostImage('')} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500/80"><X size={14} /></button></> : <label className="cursor-pointer flex flex-col items-center p-4 w-full h-full justify-center"><ImageIcon className="text-surface/40 mb-2" /><span className="text-xs text-surface/60">Click to upload</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>}</div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-surface/80">Tags</label><Input placeholder="Type & press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} /><div className="flex flex-wrap gap-2 mt-2">{tags.map(tag => <span key={tag} className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs items-center gap-1">{tag}<button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button></span>)}</div></div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 pt-4 border-t border-surface/10"><span className="text-sm text-surface/60">Status: <span className="font-bold">{status}</span></span><Button type="button" variant="secondary" onClick={() => handleSave(false)} disabled={loading}>{loading ? 'Saving...' : 'Save Draft'}</Button><Button type="submit" disabled={loading}>{loading ? 'Publishing...' : 'Publish Post'}</Button></div>
          </form>
        </GlassPanel>
      ) : (
        <div className="grid gap-4">{posts.map(post => (<GlassPanel key={post.id} className="flex items-center gap-6 p-6 group hover:bg-white/10"><Button variant="ghost" size="sm" onClick={() => toggleFeatured(post)} className={`mr-4 ${post.featured ? 'text-yellow-400' : 'text-surface/40 hover:text-yellow-400'}`}><Star size={20} fill={post.featured ? 'currentColor' : 'none'} /></Button>{post.imageUrl && <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" /></div>}<div className="flex-grow"><span className={`inline-block px-2 py-0.5 text-xs rounded-full mb-2 ${post.status === 'published' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>{post.status}</span><h3 className="text-xl font-bold text-white truncate">{post.title}</h3><p className="text-sm text-surface/60 line-clamp-1 mt-1">{post.excerpt}</p></div><div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="sm" onClick={() => handleEdit(post)}><Edit2 size={16} /></Button><Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(post.id)}><Trash2 size={16} /></Button></div></GlassPanel>))}</div>
      )}
    </div>
  );
}
