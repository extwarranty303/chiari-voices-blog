import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { GlassPanel } from '../components/ui';
import { Search } from 'lucide-react';
import SEO from '../components/SEO';
import heroImageUrl from '../assets/images/blog-homepage-hero_one.png';

interface BlogPost {
  id: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: any;
  authorName?: string;
  slug?: string;
}

function sanitizePosts(posts: any[]): BlogPost[] {
  return posts.map(post => ({
    id: post.id,
    title: typeof post.title === 'string' ? post.title : 'Untitled Post',
    excerpt: typeof post.excerpt === 'string' ? post.excerpt : 'No excerpt available.',
    imageUrl: typeof post.imageUrl === 'string' ? post.imageUrl : undefined,
    tags: Array.isArray(post.tags) ? post.tags : [],
    createdAt: post.createdAt,
    authorName: typeof post.authorName === 'string' ? post.authorName : 'Anonymous',
    slug: typeof post.slug === 'string' ? post.slug : post.id,
  }));
}

export default function PostListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'posts'), 
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sanitized = sanitizePosts(fetchedPosts);
        setPosts(sanitized);
      } catch (err: any) {
        console.error("Firebase Error:", err);
        setError("Failed to fetch posts. Please ensure Firestore indexes are configured correctly.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    try {
      return posts.filter(post => {
        const search = searchTerm.toLowerCase();
        const searchTermMatch = (post.title || '').toLowerCase().includes(search) || (post.excerpt || '').toLowerCase().includes(search);
        const tagMatch = selectedTag ? (post.tags || []).includes(selectedTag) : true;
        return searchTermMatch && tagMatch;
      });
    } catch (err) {
      console.error("Filtering Error:", err);
      setError("An error occurred while filtering posts.");
      return [];
    }
  }, [posts, searchTerm, selectedTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [posts]);

  return (
    <div className="space-y-12">
      <SEO 
        title="Blog" 
        description="Browse the latest stories and articles from the Chiari Voices community."
      />
      
      <div className="w-screen h-[40vh] relative left-1/2 -translate-x-1/2">
        <img src={heroImageUrl} alt="A vibrant, abstract image of a brain in a forest, representing thought and community" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
              Understanding Chiari Malformation
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mt-2 drop-shadow-md">
              Finding Hope & Support
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-bold text-text">All Stories</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full pl-10 pr-4 py-2 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 text-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedTag(null)} className={`px-3 py-1 rounded-full text-sm transition-colors ${!selectedTag ? 'glass-button' : 'bg-surface text-muted hover:bg-surface/80'}`}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag ? 'glass-button' : 'bg-surface text-muted hover:bg-surface/80'}`}>#{tag}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-96 glass-panel rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive"><p>{error}</p></div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <Link key={post.id} to={`/posts/${post.slug}`} className="group">
                <GlassPanel className="h-full flex flex-col p-6 transition-all duration-300 border-2 border-transparent hover:border-accent/50 hover:bg-surface/50">
                    <div className="h-40 w-full overflow-hidden rounded-lg mb-4">
                        <img src={post.imageUrl || '/placeholder.jpg'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2 flex-grow group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-muted text-sm line-clamp-3">{post.excerpt}</p>
                </GlassPanel>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <p>No stories found.</p>
          {posts.length > 0 && <p className="text-sm mt-2">Try clearing your search or tag filter.</p>}
        </div>
      )}
    </div>
  );
}
