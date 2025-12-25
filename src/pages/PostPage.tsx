import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Post } from '../lib/types';
import DOMPurify from 'dompurify';

const PostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            try {
                const postDocRef = doc(db, 'posts', slug);
                const postDoc = await getDoc(postDocRef);

                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    // Convert Firestore Timestamp to Date
                    if (postData.createdAt && postData.createdAt instanceof Timestamp) {
                        postData.createdAt = postData.createdAt.toDate();
                    }
                    setPost({ id: postDoc.id, ...postData } as Post);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                setError('Failed to fetch post');
                console.error(err);
            }
            setIsLoading(false);
        };

        fetchPost();
    }, [slug]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (!post) {
        return null; 
    }

    const sanitizedContent = DOMPurify.sanitize(post.content || '', {
        ADD_TAGS: ['iframe', 'div'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class'],
        ALLOW_DATA_ATTR: true,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        FORBID_TAGS: [],
        FORBID_ATTR: [],
    });

    return (
        <main className="bg-slate-900 text-slate-200 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <article className="prose prose-invert lg:prose-xl mx-auto">
                    {post.imageUrl && (
                        <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-xl mb-8 shadow-lg" />
                    )}
                    <h1>{post.title}</h1>
                    <div className="text-sm text-slate-400 mb-8">
                        <span>{post.createdAt ? (post.createdAt as any).toDate().toLocaleDateString() : ''}</span>
                        <span className="mx-2">·</span>
                        <span>{post.readTime} min read</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                </article>
            </div>
        </main>
    );
};

export default PostPage;
