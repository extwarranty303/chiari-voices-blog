import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, setDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassPanel, Button, Input } from './ui';
import { X, Image as ImageIcon, Tags, Lightbulb } from 'lucide-react';

const Editor = lazy(() => import('./Editor'));

interface Post {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
    // Add all other post fields here
}

interface PostEditorProps {
  post: Post | null;
  onClose: () => void;
}

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
};

export default function PostEditor({ post, onClose }: PostEditorProps) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
  
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [postImage, setPostImage] = useState('');
    const [readTime, setReadTime] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');

    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [primaryKeyword, setPrimaryKeyword] = useState('');
    const [secondaryKeywords, setSecondaryKeywords] = useState('');
  
    const [showAiIdeas, setShowAiIdeas] = useState(false);
    const [ideaTopic, setIdeaTopic] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent((post as any).content || '');
            setTags((post as any).tags || []);
            setPostImage((post as any).imageUrl || '');
            setReadTime((post as any).readTime || '');
            setStatus(post.status);
            setMetaTitle((post as any).metaTitle || '');
            setMetaDescription((post as any).metaDescription || '');
            setSlug((post as any).slug || '');
            setPrimaryKeyword((post as any).primaryKeyword || '');
            setSecondaryKeywords(((post as any).secondaryKeywords || []).join(', '));
        }
    }, [post]);

    useEffect(() => {
        if (title && !post) setSlug(generateSlug(title));
    }, [title, post]);

    const runAiHelper = useCallback(async (type: 'readTime' | 'tags' | 'ideas') => {
        setAiLoading(true);
        try {
          const blogAiHelper = httpsCallable(functions, 'blogAiHelper');
          const result: any = await blogAiHelper({ type, content, topic: ideaTopic });
          if (result.data.readTime) setReadTime(result.data.readTime);
          if (result.data.tags) setTags(prev => [...new Set([...prev, ...result.data.tags])]);
          if (result.data.ideas) setGeneratedIdeas(result.data.ideas);
        } catch (error) {
          console.error(`AI Helper Error (${type}):`, error);
          alert("AI helper failed.");
        } finally {
          setAiLoading(false);
        }
    }, [content, ideaTopic]);

    useEffect(() => {
        if (!content || content.length < 100) return;
        const timer = setTimeout(() => runAiHelper('readTime'), 2000);
        return () => clearTimeout(timer);
    }, [content, runAiHelper]);

    const handleSave = async (publish: boolean) => {
        if (!currentUser || !title.trim()) return alert("Title is required.");
        setLoading(true);
        const newStatus = publish ? 'published' : 'draft';
        setStatus(newStatus);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const excerpt = (tempDiv.textContent || '').slice(0, 150) + '...';

        const postData = {
            title, content, excerpt, tags, imageUrl: postImage, readTime, status: newStatus,
            authorId: currentUser.uid, authorName: 'Chiari Voices Admin', updatedAt: serverTimestamp(),
            metaTitle: metaTitle || title, metaDescription, slug: slug || generateSlug(title),
            primaryKeyword, secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
        };

        try {
            if (post) {
                await updateDoc(doc(db, 'posts', post.id), postData);
            } else {
                await setDoc(doc(collection(db, 'posts')), { ...postData, createdAt: serverTimestamp(), featured: false });
            }
            alert(`Post ${newStatus} successfully!`);
            onClose();
        } catch (error) {
            console.error("Error saving post:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const file = e.target.files[0];
        const storageRef = ref(storage, `blog_images/${Date.now()}_${file.name}`);
        try {
          await uploadBytes(storageRef, file);
          setPostImage(await getDownloadURL(storageRef));
        } catch (error) { console.error("Error uploading image:", error); } 
        finally { setLoading(false); }
    };
    
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
          setTagInput('');
        }
    };
      
    const removeTag = (tagToRemove: string) => setTags(tags.filter(tag => tag !== tagToRemove));

    return (
        <GlassPanel>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(true); }} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{post ? 'Edit Post' : 'Create New Post'}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}><X size={18} /> Close</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex gap-2 flex-wrap">
                            <Button type="button" size="sm" variant="secondary" onClick={() => setShowAiIdeas(!showAiIdeas)}><Lightbulb size={14} /> AI Ideas</Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => runAiHelper('tags')} disabled={aiLoading || !content}><Tags size={14} /> Gen Tags</Button>
                        </div>
                        {showAiIdeas && <div className="bg-accent/10 p-4 rounded-lg">{/* AI Ideas JSX */}</div>}
                        <Input label="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div className="border border-accent/30 rounded-lg p-1">
                            <Suspense fallback={<div>Loading Editor...</div>}><Editor value={content} onChange={setContent} /></Suspense>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div><label className="text-sm font-medium">Read Time</label><div className="glass-input rounded-lg px-4 py-2 mt-1 border border-accent/30 min-h-[42px] flex items-center">{aiLoading && !readTime ? 'Calculating...' : readTime || 'Auto-calculated'}</div></div>
                        <div><label className="text-sm font-medium">Cover Image</label><div className="relative h-40 mt-2 border-2 border-dashed border-accent/30 rounded-lg flex items-center justify-center">{postImage ? <><img src={postImage} alt="Cover" className="w-full h-full object-cover" /><button type="button" onClick={() => setPostImage('')} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><X size={14} /></button></> : <label className="cursor-pointer"><ImageIcon className="mb-2" /><span>Click to upload</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>}</div></div>
                        <div><label className="text-sm font-medium">Tags</label><Input placeholder="Type & press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} /><div className="flex flex-wrap gap-2 mt-2">{tags.map(tag => <span key={tag} className="px-2 py-1 rounded-md bg-accent/20 text-xs">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-1"><X size={12} /></button></span>)}</div></div>
                    </div>
                </div>
                <div className="pt-6 border-t border-surface/10"><h3 className="text-lg font-bold mb-4">SEO Settings</h3><div className="space-y-4"><Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /><Input label="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /><Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} /><Input label="Primary Keyword" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} /><Input label="Secondary Keywords" value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)} placeholder="Comma, separated" /></div></div>
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-surface/10">
                    <span className="text-sm text-surface/60 mr-auto">Status: <span className="font-bold capitalize">{status}</span></span>
                    <Button type="button" variant="secondary" onClick={() => handleSave(false)} disabled={loading}>{loading ? 'Saving...' : 'Save Draft'}</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Publishing...' : 'Publish Post'}</Button>
                </div>
            </form>
        </GlassPanel>
    );
}
