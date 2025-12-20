import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { GlassPanel } from '../components/ui';
import { Search, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import heroImageUrl from '/blog-hero.jpg'; // Direct import for reliability

interface Post {
  id: string;
  slug: string;
  title?: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
  createdAt?: any;
  authorName?: string;
  readTime?: number;
}

// Simple slugify function
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

function sanitizePosts(posts: any[]): Post[] {
  return posts.map(post => ({
    id: post.id,
    slug: post.slug || slugify(post.title || ''),
    title: typeof post.title === 'string' ? post.title : 'Untitled Post',
    excerpt: typeof post.excerpt === 'string' ? post.excerpt : 'No excerpt available.',
    imageUrl: typeof post.imageUrl === 'string' ? post.imageUrl : undefined,
    tags: Array.isArray(post.tags) ? post.tags : [],
    createdAt: post.createdAt,
    authorName: typeof post.authorName === 'string' ? post.authorName : 'Anonymous',
    readTime: typeof post.readTime === 'number' ? post.readTime : 0,
  }));
}

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
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
        title="Posts" 
        description="Browse the latest stories and articles from the Chiari Voices community."
      />
      
      {/* Static Hero Image Section */}
      <div className="w-full h-80 rounded-xl overflow-hidden relative">
        <img src={heroImageUrl} alt="A person standing on a cliff overlooking a sunrise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
            Understanding Chiari Malformation
          </h1>
          <p className="text-xl md:text-2xl text-surface/90 mt-2 drop-shadow-md">
            Finding Hope & Support
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-bold text-white">All Stories</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface/50" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full pl-10 pr-4 py-2 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedTag(null)} className={`px-3 py-1 rounded-full text-sm transition-colors ${!selectedTag ? 'bg-accent text-white' : 'bg-surface/10 text-surface/60 hover:bg-surface/20'}`}>All</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag ? 'bg-accent text-white' : 'bg-surface/10 text-surface/60 hover:bg-surface/20'}`}>#{tag}</button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => <GlassPanel key={i} className="h-80" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400"><p>{error}</p></div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <Link key={post.slug} to={`/posts/${post.slug}`} className="group">
              <GlassPanel className="h-full flex flex-col p-6 hover:bg-white/10 transition-colors">
                <div className="h-40 w-full overflow-hidden rounded-lg mb-4">
                  <img src={post.imageUrl || '/placeholder.jpg'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 flex-grow group-hover:underline line-clamp-2">{post.title}</h3>
                <p className="text-surface/60 text-sm line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-surface/60 text-xs mt-4">
                    <Clock size={12} />
                    <span>{post.readTime} min read</span>
                </div>
              </GlassPanel>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-surface/50">
          <p>No stories found.</p>
          {posts.length > 0 && <p className="text-sm mt-2">Try clearing your search or tag filter.</p>}
        </div>
      )}
    </div>
  );
}
