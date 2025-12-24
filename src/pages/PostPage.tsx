import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calculateReadTime } from '../utils/readTime';
import CommentSection from '../components/CommentSection';
import { ShareButtons } from '../components/ShareButtons';
import SEO from '../components/SEO';
import { ArrowLeft, Calendar, Clock, Tag, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: any;
    authorName?: string;
    tags?: string[];
    readTime?: number;
    imageUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
}

export default function PostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Try finding by slug first
                const q = query(collection(db, 'posts'), where('slug', '==', slug));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    setPost({ id: querySnapshot.docs[0].id, ...docData } as Post);
                } else {
                    // Fallback: Try ID if slug lookup failed (legacy support or direct ID access)
                    const docRef = doc(db, 'posts', slug);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                         setPost({ id: docSnap.id, ...docSnap.data() } as Post);
                    }
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent" size={40} /></div>;
    
    if (!post) return (
        <div className="container mx-auto px-4 py-12 text-center">
             <h1 className="text-2xl font-bold mb-4">Post not found</h1>
             <Link to="/posts"><Button>Back to Posts</Button></Link>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
             <SEO 
                title={post.metaTitle || post.title} 
                description={post.metaDescription || post.content.substring(0, 150)} 
                image={post.imageUrl}
             />

            <Link to="/posts" className="inline-flex items-center text-accent hover:text-accent/80 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Back to Posts
            </Link>

            <article className="bg-surface/5 rounded-2xl overflow-hidden border border-surface/10 shadow-lg">
                {post.imageUrl && (
                    <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-64 md:h-96 object-cover"
                    />
                )}
                
                <div className="p-6 md:p-10">
                    <div className="flex flex-wrap gap-4 items-center text-sm text-surface/60 mb-6">
                        {post.createdAt && (
                             <div className="flex items-center">
                                <Calendar size={16} className="mr-1" />
                                {new Date(post.createdAt.toDate()).toLocaleDateString()}
                            </div>
                        )}
                        <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {post.readTime || calculateReadTime(post.content)} min read
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-6 font-display text-surface leading-tight">
                        {post.title}
                    </h1>

                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {post.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                    <Tag size={12} className="mr-1" /> {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    <div className="mt-12 pt-8 border-t border-surface/10">
                         <h3 className="text-lg font-bold mb-4">Share this post</h3>
                         <ShareButtons post={post} />
                    </div>
                </div>
            </article>

            <div className="mt-12">
                <CommentSection postId={post.id} />
            </div>
        </div>
    );
}
