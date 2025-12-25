import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, setDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Button } from './ui';
import { X } from "lucide-react";
import { calculateReadTime } from '../utils/readTime';
import ChiariEditor from './editor/ChiariEditor';
import { FieldValue } from 'firebase/firestore';

interface Post {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'published' | 'archived';
    readTime?: number;
    createdAt: Timestamp | FieldValue;
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
    updatedAt?: Timestamp | FieldValue;
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
        if (title && !post) {
            (async () => {
                setSlug(generateSlug(title));
            })();
        }
    }, [title, post]);

    useEffect(() => {
        (async () => {
            const time = calculateReadTime(content);
            setReadTime(time);
        })();
    }, [content]);

    const handleSave = async () => {
        if (!user || !title.trim()) return alert("Title is required.");

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const excerpt = (tempDiv.textContent || '').slice(0, 150) + '...';

        const postData: any = {
            title, content, excerpt, tags, imageUrl: coverImage, status, readTime,
            authorId: user.uid, authorName: 'Chiari Voices Admin', updatedAt: serverTimestamp(),
            metaTitle: metaTitle || title, metaDescription, slug: slug || generateSlug(title),
            primaryKeyword, secondaryKeywords: secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
        };

        try {
            if (post) {
                await updateDoc(doc(db, 'posts', post.id), postData);
            } else {
                await setDoc(doc(collection(db, 'posts')), { ...postData, createdAt: serverTimestamp(), featured: false });
            }
            // Success feedback is now handled by the editor component
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Check console for details.");
        }
    };
    
    return (
        <div className="p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-surface/10">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{post ? 'Edit Post' : 'Create New Post'}</h2>
                    <Button variant="destructive" size="icon" onClick={onClose}><X /></Button>
                </div>

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
                />
            </form>
        </div>
    );
}
