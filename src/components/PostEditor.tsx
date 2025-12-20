import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, setDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GlassPanel, Button, Input } from './ui';
import { X, Image as ImageIcon, Clock, Eye } from "lucide-react";
import { calculateReadTime } from '../utils/readTime';
import TiptapEditor from './TiptapEditor';
import PostPreview from './PostPreview';

interface Post {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published';
    readTime?: number;
    createdAt: Timestamp;
    tags?: string[];
    imageUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    excerpt?: string;
    authorId?: string;
    authorName?: string;
    updatedAt?: Timestamp;
    featured?: boolean;
}

interface PostEditorProps {
  post: Post | null;
  onClose: () => void;
}

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
};

export default function PostEditor({ post, onClose }: PostEditorProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
  
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [postImage, setPostImage] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [readTime, setReadTime] = useState(0);
    const [isPreviewing, setIsPreviewing] = useState(false);

    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [primaryKeyword, setPrimaryKeyword] = useState('');
    const [secondaryKeywords, setSecondaryKeywords] = useState('');

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content || '');
            setTags(post.tags || []);
            setPostImage(post.imageUrl || '');
            setStatus(post.status);
            setReadTime(post.readTime || 0);
            setMetaTitle(post.metaTitle || '');
            setMetaDescription(post.metaDescription || '');
            setSlug(post.slug || '');
            setPrimaryKeyword(post.primaryKeyword || '');
            setSecondaryKeywords((post.secondaryKeywords || []).join(', '));
        } else {
          // Reset state for new post
          setTitle('');
          setContent('');
          setTags([]);
          setTagInput('');
          setPostImage('');
          setStatus('draft');
          setReadTime(0);
          setMetaTitle('');
          setMetaDescription('');
          setSlug('');
          setPrimaryKeyword('');
          setSecondaryKeywords('');
        }
    }, [post]);

    useEffect(() => {
        if (title && !post) setSlug(generateSlug(title));
    }, [title, post]);

    useEffect(() => {
        const time = calculateReadTime(content);
        setReadTime(time);
    }, [content]);

    const handleSave = async (publish: boolean) => {
        if (!user || !title.trim()) return alert("Title is required.");
        setLoading(true);
        const newStatus = publish ? 'published' : 'draft';
        setStatus(newStatus);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const excerpt = (tempDiv.textContent || '').slice(0, 150) + '...';

        const postData: Partial<Post> = {
            title, content, excerpt, tags, imageUrl: postImage, status: newStatus, readTime,
            authorId: user.uid, authorName: 'Chiari Voices Admin', updatedAt: serverTimestamp() as any,
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
        <>
            <div className="p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-surface/10">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(true); }} className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{post ? 'Edit Post' : 'Create New Post'}</h2>
                        <Button variant="destructive" size="icon" onClick={onClose}><X /></Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left/Main Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Input label="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            
                            <TiptapEditor value={content} onChange={setContent} />

                            <div className="pt-6 border-t border-surface/10">
                                <h3 className="text-lg font-bold text-white mb-4">SEO Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                                <Input label="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                                <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                                <Input label="Primary Keyword" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} />
                                <Input label="Secondary Keywords" value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)} placeholder="Comma, separated" />
                                </div>
                            </div>
                        </div>

                        {/* Right/Sidebar Column */}
                        <div className="space-y-6">
                            <GlassPanel className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">Actions</h3>
                                    <span className="text-sm text-surface/60 capitalize">{status}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button type="button" variant="outline" onClick={() => setIsPreviewing(true)} disabled={loading} className="w-full flex items-center gap-2">
                                    <Eye size={16}/> Preview
                                  </Button>
                                  <div className="flex gap-2">
                                    <Button type="button" variant="secondary" onClick={() => handleSave(false)} disabled={loading} className="w-full">{loading ? 'Saving...' : 'Save Draft'}</Button>
                                    <Button type="submit" disabled={loading} className="w-full">{loading ? 'Publishing...' : 'Publish'}</Button>
                                  </div>
                                    <Button type="button" variant="ghost" onClick={onClose} className="w-full">Close</Button>
                                </div>
                            </GlassPanel>

                            <GlassPanel className="p-4">
                                <label className="text-sm font-medium text-white">Cover Image</label>
                                <div className="relative h-40 mt-2 border-2 border-dashed border-accent/30 rounded-lg flex items-center justify-center bg-surface/10">
                                    {postImage ? (
                                        <><img src={postImage} alt="Cover" className="w-full h-full object-cover rounded-md" /><button type="button" onClick={() => setPostImage('')} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><X size={14} /></button></>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center p-4 w-full h-full justify-center text-surface/60 hover:text-white">
                                            <ImageIcon className="mb-2" />
                                            <span>Click to upload</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </GlassPanel>
                            
                            <GlassPanel className="p-4">
                                <label className="text-sm font-medium text-white">Tags</label>
                                <Input placeholder="Type & press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="mt-2"/>
                                <div className="flex flex-wrap gap-2 mt-2">{tags.map(tag => <span key={tag} className="px-2 py-1 rounded-md bg-accent/20 text-xs text-white">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-1 text-white/70 hover:text-white"><X size={12} /></button></span>)}</div>
                            </GlassPanel>
                            
                            <div className="text-center text-surface/60 flex items-center justify-center gap-2"><Clock size={14} /><span>~{readTime} min read</span></div>
                        </div>
                    </div>
                </form>
            </div>

            {isPreviewing && (
                <PostPreview 
                    postData={{
                        title, content, tags, imageUrl: postImage, readTime,
                        authorName: 'Chiari Voices Admin',
                        createdAt: post?.createdAt || Timestamp.now()
                    }}
                    onClose={() => setIsPreviewing(false)} 
                />
            )}
        </>
    );
}
