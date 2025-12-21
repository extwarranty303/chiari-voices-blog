import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { Button, GlassPanel } from '../components/ui';
import { ArrowLeft, Clock, User as UserIcon, Calendar, Tag } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import CommentSection from '../components/CommentSection';
import { ShareButtons } from '../components/ShareButtons';

// Define the Post interface
interface Post {
  id: string;
  title: string;
  content: string;
  authorName?: string;
  slug?: string;
  createdAt?: any;
  tags?: string[];
  readTime?: number;
  imageUrl?: string;
  metaDescription?: string;
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const postSnap = querySnapshot.docs[0];
          const postData = { id: postSnap.id, ...postSnap.data() } as Post;
          setPost(postData);
          
          document.title = postData.title;
          if (postData.metaDescription) {
            const metaDescTag = document.querySelector('meta[name="description"]');
            if (metaDescTag) {
              metaDescTag.setAttribute('content', postData.metaDescription);
            } else {
              const newMetaTag = document.createElement('meta');
              newMetaTag.name = "description";
              newMetaTag.content = postData.metaDescription;
              document.head.appendChild(newMetaTag);
            }
          }

        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.content && contentRef.current) {
      const sanitizedContent = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } });
      contentRef.current.innerHTML = sanitizedContent;
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [post]);

  if (loading) {
    return <div className="text-center p-8 text-text">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-text">Post not found</h2>
        <Link to="/"><Button variant="primary">Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
        <article>
            <header className="mb-8">
                <Link to="/posts" className="inline-flex items-center gap-2 text-accent mb-4 hover:underline">
                    <ArrowLeft size={16} />
                    Back to all articles
                </Link>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-3">{post.title}</h1>
                
                {post.readTime && (
                    <div className="flex items-center gap-2 text-muted text-sm mt-4">
                        <Clock size={16} />
                        <span>{post.readTime} min read</span>
                    </div>
                )}
            </header>

            <GlassPanel className="p-12">
                <div className="flex items-center justify-between text-muted border-b border-border/10 pb-4 mb-8">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2">
                        <UserIcon size={18} />
                        <span className="font-medium text-text">{post.authorName || 'Chiari Voices Admin'}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMMM d, yyyy') : 'Unknown Date'}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ShareButtons post={post} />
                    </div>
                </div>

                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-xl mb-8" />}

                <div 
                  id="post-content" 
                  ref={contentRef}
                  className="prose prose-invert prose-lg max-w-none mx-auto text-text/90 prose-headings:text-text prose-a:text-accent prose-strong:text-text prose-blockquote:border-accent"
                ></div>
                
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/10 flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-text"><Tag size={16} /></span>
                        {post.tags.map(tag => (
                            <Link to={`/posts?tag=${tag}`} key={tag} className="px-3 py-1 text-sm rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
                                {tag}
                            </Link>
                        ))}
                    </div>
                )}
            </GlassPanel>
        </article>
        
        <CommentSection postId={post.id} />
    </div>
  );
}
