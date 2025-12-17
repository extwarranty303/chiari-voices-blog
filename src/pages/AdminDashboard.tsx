import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassPanel, Button, Input } from '../components/ui';
import Editor from '../components/Editor';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Lightbulb, List, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  imageUrl?: string;
  status: 'draft' | 'published';
  createdAt: any;
  authorId: string;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Form State
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [postImage, setPostImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // AI Dialog State
  const [showAiIdeas, setShowAiIdeas] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: BlogPost[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
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
      alert("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // --- AI Functions ---

  const generateIdeas = async () => {
    if (!ideaTopic) return;
    setAiLoading(true);
    try {
      const generatePostIdeas = httpsCallable(functions, 'generatePostIdeas');
      const result: any = await generatePostIdeas({ topic: ideaTopic });
      if (result.data?.ideas) {
        setGeneratedIdeas(result.data.ideas);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to generate ideas. Ensure Cloud Functions are deployed.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateOutline = async () => {
    if (!title) {
      alert("Please enter a title first.");
      return;
    }
    setAiLoading(true);
    try {
      const generateOutlineFunc = httpsCallable(functions, 'generateOutline');
      const result: any = await generateOutlineFunc({ title });
      const data = result.data;
      
      let outlineHtml = `<h2>Introduction</h2><p>${data.introduction}</p>`;
      data.sections.forEach((section: any) => {
        outlineHtml += `<h3>${section.heading}</h3><ul>${section.points.map((p: string) => `<li>${p}</li>`).join('')}</ul>`;
      });
      outlineHtml += `<h2>Conclusion</h2><p>${data.conclusion}</p>`;
      
      setContent(prev => prev + outlineHtml);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to generate outline.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateSeo = async () => {
    if (!content) return;
    setAiLoading(true);
    try {
      const generateSeoFunc = httpsCallable(functions, 'generateSeo');
      const result: any = await generateSeoFunc({ content });
      const { keywords, metaDescription } = result.data;
      
      // Merge new keywords
      const newTags = [...tags];
      keywords.forEach((k: string) => {
        if (!newTags.includes(k)) newTags.push(k);
      });
      setTags(newTags);
      
      alert(`SEO Optimized!\n\nAdded Keywords: ${keywords.join(', ')}\n\nMeta Description (Copy this): ${metaDescription}`);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to analyze SEO.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- End AI Functions ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    
    // Simple excerpt generation (first 150 chars of text content)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const excerpt = plainText.slice(0, 150) + '...';

    const postData = {
      title,
      content,
      excerpt,
      tags,
      imageUrl: postImage,
      status,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonymous',
      updatedAt: serverTimestamp(),
    };

    try {
      if (currentPostId) {
        // Update existing
        await updateDoc(doc(db, 'posts', currentPostId), postData);
      } else {
        // Create new
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: serverTimestamp(),
        });
      }
      
      resetForm();
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
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
    setStatus(post.status);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const resetForm = () => {
    setCurrentPostId(null);
    setTitle('');
    setContent('');
    setTags([]);
    setPostImage('');
    setStatus('draft');
  };

  // Only Admin/Moderator Check
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  if (!canManage) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-surface/60 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Blog Management</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus size={18} /> New Post
          </Button>
        )}
      </div>

      {isEditing ? (
        <GlassPanel>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {currentPostId ? 'Edit Post' : 'Create New Post'}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); resetForm(); }}>
              <X size={18} /> Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                
                {/* AI Tools Bar */}
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setShowAiIdeas(!showAiIdeas)}>
                    <Lightbulb size={14} /> AI Ideas
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={generateOutline} disabled={aiLoading || !title}>
                    <List size={14} /> {aiLoading ? 'Thinking...' : 'Gen Outline'}
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={generateSeo} disabled={aiLoading || !content}>
                    <Search size={14} /> {aiLoading ? 'Analyzing...' : 'Analyze SEO'}
                  </Button>
                </div>

                {/* AI Ideas Panel */}
                {showAiIdeas && (
                  <div className="bg-accent/10 p-4 rounded-lg mb-4 border border-accent/20">
                    <div className="flex gap-2 mb-3">
                      <Input 
                        placeholder="Enter a topic (e.g., 'Chiari Symptoms')" 
                        value={ideaTopic}
                        onChange={(e) => setIdeaTopic(e.target.value)}
                        className="bg-black/20"
                      />
                      <Button type="button" onClick={generateIdeas} disabled={aiLoading}>
                        {aiLoading ? '...' : 'Go'}
                      </Button>
                    </div>
                    {generatedIdeas.length > 0 && (
                      <ul className="space-y-2">
                        {generatedIdeas.map((idea, idx) => (
                          <li key={idx} className="flex items-center justify-between text-sm text-surface/80 bg-black/20 p-2 rounded">
                            {idea}
                            <button 
                              type="button" 
                              onClick={() => { setTitle(idea); setShowAiIdeas(false); }}
                              className="text-accent hover:text-white text-xs font-bold"
                            >
                              Use
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <Input 
                  label="Post Title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter a catchy title..."
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface/80">Content</label>
                  <Editor 
                    value={content} 
                    onChange={setContent} 
                    placeholder="Write your story here..." 
                  />
                </div>
              </div>

              <div className="space-y-6">
                {/* Publishing Status */}
                <div className="space-y-2">
                   <label className="text-sm font-medium text-surface/80">Status</label>
                   <select 
                     value={status} 
                     onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                     className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 text-black"
                   >
                     <option value="draft">Draft</option>
                     <option value="published">Published</option>
                   </select>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface/80">Cover Image</label>
                  <div className={`relative h-40 rounded-lg border-2 border-dashed border-surface/20 flex flex-col items-center justify-center overflow-hidden transition-colors ${!postImage ? 'hover:bg-surface/5' : ''}`}>
                    {postImage ? (
                      <>
                        <img src={postImage} alt="Cover" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setPostImage('')}
                          className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500/80 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center p-4 w-full h-full justify-center">
                        <ImageIcon className="text-surface/40 mb-2" />
                        <span className="text-xs text-surface/60">Click to upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface/80">Tags</label>
                  <Input 
                    placeholder="Type & press Enter..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface/10">
               <Button type="submit" disabled={loading} className="w-full md:w-auto">
                 {loading ? 'Saving...' : (
                   <><Save size={18} /> {currentPostId ? 'Update Post' : 'Create Post'}</>
                 )}
               </Button>
            </div>
          </form>
        </GlassPanel>
      ) : (
        <div className="grid gap-4">
          {posts.length === 0 ? (
            <GlassPanel className="text-center py-12 text-surface/50">
              No posts found. Create your first one!
            </GlassPanel>
          ) : (
            posts.map(post => (
              <GlassPanel key={post.id} className="flex flex-col md:flex-row gap-6 p-6 items-start md:items-center group hover:bg-white/10 transition-colors">
                {post.imageUrl && (
                  <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${post.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="text-xs uppercase tracking-wider text-surface/60 font-medium">{post.status}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white truncate">{post.title}</h3>
                  <p className="text-sm text-surface/60 line-clamp-1 mt-1">{post.excerpt}</p>
                  <div className="flex gap-2 mt-3">
                    {post.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-surface/40 bg-surface/5 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(post.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}
    </div>
  );
}
