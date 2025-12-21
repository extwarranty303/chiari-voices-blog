import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button, GlassPanel } from '../components/ui';
import { ArrowRight, Rss, UserPlus } from 'lucide-react';
import SEO from '../components/SEO';
import heroImageUrl from '../assets/images/blog-home-hero-two.png';
import ShareStoryForm from '../components/home/ShareStoryForm';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  slug?: string;
}

export default function Home() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const featuredQuery = query(collection(db, 'posts'), where('featured', '==', true), where('status', '==', 'published'), limit(1));
        const featuredSnapshot = await getDocs(featuredQuery);
        if (!featuredSnapshot.empty) {
          const post = featuredSnapshot.docs[0];
          setFeaturedPost({ id: post.id, ...post.data() } as Post);
        }

        const latestQuery = query(collection(db, 'posts'), where('featured', '!=', true), where('status', '==', 'published'), orderBy('featured', 'asc'), orderBy('createdAt', 'desc'), limit(3));
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
      
      <div className="w-screen h-[50vh] relative left-1/2 -translate-x-1/2">
        <img src={heroImageUrl} alt="A vibrant, abstract image of a brain in a forest, representing thought and community" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter drop-shadow-lg">
            Sharing Stories. Finding Strength.
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto drop-shadow-md">
            Welcome to Chiari Voices, a safe and supportive community blog for individuals and families navigating the complexities of Chiari Malformation.
          </p>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-surface/5 rounded-lg"></div>
            <div className="grid md:grid-cols-3 gap-6"><div className="h-64 bg-surface/5 rounded-lg"></div><div className="h-64 bg-surface/5 rounded-lg"></div><div className="h-64 bg-surface/5 rounded-lg"></div></div>
          </div>
        ) : (
          <div className="space-y-8">
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <GlassPanel className="grid md:grid-cols-2 gap-8 items-center overflow-hidden p-8 hover:bg-white/10 transition-colors">
                  <div className="order-2 md:order-1">
                    <h2 className="text-4xl font-bold text-white mb-4 group-hover:underline">{featuredPost.title}</h2>
                    <p className="text-surface/70 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center font-semibold text-accent">Read Full Story <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" /></div>
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
                  <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                    <GlassPanel className="h-full flex flex-col p-6 hover:bg-white/10 transition-colors">
                       <div className="h-40 w-full overflow-hidden rounded-lg mb-4"><img src={post.imageUrl || '/placeholder.jpg'} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
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

      {/* Redesigned Join Community Section */}
      <section>
        <GlassPanel className="p-12 shimmer-effect text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Join the Community</h2>
            <p className="text-surface/70 max-w-2xl mx-auto mb-8">
                Create an account to share your story, comment on articles, and connect with others in the Chiari community. Your voice matters.
            </p>
            <div className="flex flex-col items-center gap-4">
                <Button asChild size="lg" variant="primary" className="w-full md:w-auto">
                    <Link to="/login">
                        <UserPlus size={20} className="mr-2" /> Create Your Account
                    </Link>
                </Button>
                <p className="text-sm text-surface/60">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline font-medium">Log In</Link>
                </p>
            </div>
        </GlassPanel>
      </section>

      <section>
        <ShareStoryForm />
      </section>

      <section className="text-center">
        <GlassPanel className="p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-surface/70 mb-6">Dive into our collection of stories, insights, and shared experiences.</p>
          <Button asChild size="lg" variant="primary">
            <Link to="/blog">
              <Rss size={18} className="mr-2" /> Browse All Articles
            </Link>
          </Button>
        </GlassPanel>
      </section>
    </div>
  );
}
