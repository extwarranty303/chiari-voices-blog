import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button, GlassPanel } from '../components/ui';
import { ArrowRight, Rss } from 'lucide-react';
import SEO from '../components/SEO';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
}

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Fetch the single featured post
        const featuredQuery = query(
          collection(db, 'posts'),
          where('featured', '==', true),
          where('status', '==', 'published'),
          limit(1)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        if (!featuredSnapshot.empty) {
          const post = featuredSnapshot.docs[0];
          setFeaturedPost({ id: post.id, ...post.data() } as Post);
        }

        // Fetch the 3 most recent non-featured posts
        const latestQuery = query(
          collection(db, 'posts'),
          where('featured', '!=', true),
          where('status', '==', 'published'),
          orderBy('featured', 'asc'), // This seems odd, but is required by Firestore for the inequality filter
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const latestSnapshot = await getDocs(latestQuery);
        const posts = latestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
        setLatestPosts(posts);

      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="space-y-12">
      <SEO 
        title="Home"
        description="Chiari Voices: A safe, supportive community blog for sharing stories and finding strength in the face of Chiari Malformation."
      />
      
      {/* Hero Section */}
      <header className="text-center py-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
          Sharing Stories. Finding Strength.
        </h1>
        <p className="text-lg md:text-xl text-surface/70 max-w-3xl mx-auto">
          Welcome to Chiari Voices, a safe and supportive community blog for individuals and families navigating the complexities of Chiari Malformation.
        </p>
      </header>

      {/* Featured & Latest Posts */}
      <section>
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-surface/5 rounded-lg"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="h-64 bg-surface/5 rounded-lg"></div>
              <div className="h-64 bg-surface/5 rounded-lg"></div>
              <div className="h-64 bg-surface/5 rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {featuredPost && (
              <Link to={`/blog/${featuredPost.id}`} className="block group">
                <GlassPanel className="grid md:grid-cols-2 gap-8 items-center overflow-hidden p-8 hover:bg-white/10 transition-colors">
                  <div className="order-2 md:order-1">
                    <h2 className="text-4xl font-bold text-white mb-4 group-hover:underline">{featuredPost.title}</h2>
                    <p className="text-surface/70 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center font-semibold text-accent">
                      Read Full Story <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="order-1 md:order-2 h-64 md:h-full w-full overflow-hidden rounded-lg">
                    <img src={featuredPost.imageUrl || '/placeholder.jpg'} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </GlassPanel>
              </Link>
            )}

            {latestPosts.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {latestPosts.map(post => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="block group">
                    <GlassPanel className="h-full flex flex-col p-6 hover:bg-white/10 transition-colors">
                       <div className="h-40 w-full overflow-hidden rounded-lg mb-4">
                         <img src={post.imageUrl || '/placeholder.jpg'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       </div>
                       <h3 className="text-xl font-bold text-white mb-2 flex-grow group-hover:underline">{post.title}</h3>
                       <p className="text-surface/60 text-sm line-clamp-3">{post.excerpt}</p>
                    </GlassPanel>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <GlassPanel className="p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-surface/70 mb-6">Dive into our collection of stories, insights, and shared experiences.</p>
          <Button asChild size="lg">
            <Link to="/blog">
              <Rss size={18} className="mr-2" /> Browse All Articles
            </Link>
          </Button>
        </GlassPanel>
      </section>
    </div>
  );
}
