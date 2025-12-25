import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, updateDoc, doc, serverTimestamp, addDoc, FieldValue, Timestamp } from 'firebase/firestore';
import { Button } from './ui';
import { X } from "lucide-react";
import { calculateReadTime } from '../utils/readTime';
import type { Post } from '../lib/types';

const ChiariEditor = lazy(() => import('./editor/ChiariEditor'));

const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
};

interface PostEditorProps {
  post: Post | null;
  onClose: () => void;
  onSave: (savedPost: Post) => void; 
}

export default function PostEditor({ post, onClose, onSave: onSaveCallback }: PostEditorProps) {
    const { user } = useAuth();
  
    const [currentPost, setCurrentPost] = useState<Post | null>(post);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [coverImage, setCoverImage] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [readTime, setReadTime] = useState(0);

    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [slug, setSlug] = useState('');
    const [primaryKeyword, setPrimaryKeyword] = useState('');
    const [secondaryKeywords, setSecondaryKeywords] = useState('');

    useEffect(() => {
        if (post) {
            setCurrentPost(post);
            setTitle(post.title);
            setContent(post.content || '');
            setTags(post.tags || []);
            setCoverImage(post.imageUrl || '');
            setStatus(post.status);
            setReadTime(post.readTime || 0);
            setMetaTitle(post.metaTitle || '');
            setMetaDescription(post.metaDescription || '');
            setSlug(post.slug || '');
            setPrimaryKeyword(post.primaryKeyword || '');
            setSecondaryKeywords((post.secondaryKeywords || []).join(', '));
        } else {
          // Reset state for new post
          setCurrentPost(null);
          setTitle('');
          setContent('');
          setTags([]);
          setCoverImage('');
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
        if (title && !currentPost) {
            setSlug(generateSlug(title));
        }
    }, [title, currentPost]);

    useEffect(() => {
        const time = calculateReadTime(content);
        setReadTime(time);
    }, [content]);

    const handleSave = async () => {
        if (!user || !title.trim()) {
            alert("Title is required.");
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const excerpt = (tempDiv.textContent || '').slice(0, 150) + '...';

        const postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> & { updatedAt: FieldValue } = {
            title, content, excerpt, tags, imageUrl: coverImage, status, readTime,
            authorId: user.uid, 
            authorName: user.displayName || 'Chiari Voices Admin', 
            updatedAt: serverTimestamp(),
            metaTitle: metaTitle || title, 
            metaDescription, 
            slug: slug || generateSlug(title),
            primaryKeyword, 
            secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
        };

        try {
            let savedPostData: Post;
            if (currentPost && currentPost.id) {
                const postRef = doc(db, 'posts', currentPost.id);
                await updateDoc(postRef, postData);
                savedPostData = { ...currentPost, ...postData, updatedAt: Timestamp.now() };
            } else {
                const docRef = await addDoc(collection(db, 'posts'), { 
                    ...postData, 
                    createdAt: serverTimestamp(), 
                    featured: false 
                });
                savedPostData = { 
                    ...postData, 
                    id: docRef.id, 
                    createdAt: Timestamp.now(), 
                    featured: false,
                    updatedAt: Timestamp.now(),
                };
                setCurrentPost(savedPostData); 
            }
            onSaveCallback(savedPostData);
            // Success feedback is handled by ChiariEditor
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Check console for details.");
        }
    };
    
    return (
        <div className="p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-surface/10">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{currentPost ? 'Edit Post' : 'Create New Post'}</h2>
                    <Button variant="destructive" size="icon" onClick={onClose}><X /></Button>
                </div>
                <Suspense fallback={<div>Loading Editor...</div>}>
                    <ChiariEditor 
                        content={content}
                        onSave={handleSave}
                        title={title}
                        status={status}
                        tags={tags}
                        metaTitle={metaTitle}
                        metaDescription={metaDescription}
                        slug={slug}
                        primaryKeyword={primaryKeyword}
                        secondaryKeywords={secondaryKeywords}
                        coverImage={coverImage}
                        setCoverImage={setCoverImage}
                        setContent={setContent}
                        setTitle={setTitle}
                        setStatus={setStatus}
                        setTags={setTags}
                        setMetaTitle={setMetaTitle}
                        setMetaDescription={setMetaDescription}
                        setSlug={setSlug}
                        setPrimaryKeyword={setPrimaryKeyword}
                        setSecondaryKeywords={setSecondaryKeywords}
                        onClose={onClose}
                        post={currentPost}
                    />
                </Suspense>
            </form>
        </div>
    );
}