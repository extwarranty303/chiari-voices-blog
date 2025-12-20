import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { GlassPanel } from '../components/ui';
import { Calendar, User as UserIcon, ArrowLeft, Loader2, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import CommentsSection from '../components/CommentsSection';
import SEO from '../components/SEO';
import hljs from 'highlight.js';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: any;
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  readTime?: number;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          console.log("No such document for slug:", slug);
          navigate('/404');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  useEffect(() => {
    if (post && contentRef.current) {
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block as HTMLElement);
      });
    }
  }, [post]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Post Not Found</h2>
        <Link to="/posts" className="text-accent hover:underline mt-4 inline-block">Return to Posts</Link>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(post.content);
  
  const plainTextContent = post.content.replace(/<[^>]+>/g, '');
  const fallbackDescription = plainTextContent.slice(0, 160) + (plainTextContent.length > 160 ? '...' : '');
  
  const allKeywords = [
    ...(post.primaryKeyword ? [post.primaryKeyword] : []),
    ...(post.secondaryKeywords || []),
    ...(post.tags || [])
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || fallbackDescription}
        keywords={allKeywords}
        image={post.imageUrl}
        type="article"
      />

      <Link to="/posts" className="inline-flex items-center text-surface/60 hover:text-accent mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back to Posts
      </Link>

      <article>
        <header className="mb-8">
           <div className="flex gap-2 mb-4">
            {post.tags?.map(tag => (
              <span key={tag} className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-surface/60 border-y border-surface/10 py-4">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <UserIcon size={18} />
                <span className="font-medium text-surface/80">Chiari Voices Admin</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy') : 'Unknown Date'}</span>
              </span>
              {post.readTime && (
                <span className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{post.readTime} min read</span>
                </span>
              )}
            </div>
            
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        {post.imageUrl && (
          <div className="mb-10 rounded-xl overflow-hidden shadow-2xl">
            <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        <GlassPanel className="p-8 md:p-12 mb-12">
          <div 
            ref={contentRef}
            className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-display prose-headings:font-bold prose-headings:text-white
              prose-p:text-surface/80 prose-p:leading-relaxed
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-lg
              prose-blockquote:border-l-accent prose-blockquote:bg-surface/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
          />
        </GlassPanel>
      </article>

      <CommentsSection postId={post.id} />
    </div>
  );
}
