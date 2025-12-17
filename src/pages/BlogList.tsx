import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { GlassPanel } from '../components/ui';
import { Calendar, User as UserIcon, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import SEO from '../components/SEO';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  tags: string[];
  createdAt: any;
  authorName: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'posts'), 
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      // Note: Firestore requires composite indexes for complex queries (e.g., where + orderBy).
      // If filtering by tag, we might need to do client-side filtering if indexes aren't set up yet,
      // or ensure 'tags' array-contains query is supported.
      
      const querySnapshot = await getDocs(q);
      let fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];

      // Client-side filtering for search and tags to avoid index issues during dev
      if (selectedTag) {
        fetchedPosts = fetchedPosts.filter(post => post.tags?.includes(selectedTag));
      }
      
      setPosts(fetchedPosts);

      // Extract unique tags for filter
      const tags = new Set<string>();
      fetchedPosts.forEach(post => post.tags?.forEach(tag => tags.add(tag)));
      setAllTags(Array.from(tags));

    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <SEO 
        title="Blog" 
        description="Browse the latest stories and articles from the Chiari Voices community."
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-bold text-white">Latest Stories</h1>
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

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${!selectedTag ? 'bg-accent text-white' : 'bg-surface/10 text-surface/60 hover:bg-surface/20'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTag === tag ? 'bg-accent text-white' : 'bg-surface/10 text-surface/60 hover:bg-surface/20'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeletons
          [...Array(6)].map((_, i) => (
            <GlassPanel key={i} className="h-96 animate-pulse">
              <div className="h-48 bg-surface/5 rounded-lg mb-4" />
              <div className="h-6 w-3/4 bg-surface/5 rounded mb-2" />
              <div className="h-4 w-full bg-surface/5 rounded mb-2" />
              <div className="h-4 w-1/2 bg-surface/5 rounded" />
            </GlassPanel>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group">
              <GlassPanel className="h-full flex flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-white/10">
                <div className="h-48 overflow-hidden rounded-lg mb-4 relative">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface/10 to-surface/5 flex items-center justify-center">
                      <span className="text-surface/20 font-display text-4xl font-bold">CV</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end">
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs font-medium bg-black/60 text-white backdrop-blur-md px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-surface/60 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {post.createdAt?.seconds ? format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon size={12} />
                      {post.authorName}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-surface/70 text-sm line-clamp-3 mb-4 flex-grow">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center text-accent text-sm font-medium mt-auto group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </GlassPanel>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-surface/50">
            No stories found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
