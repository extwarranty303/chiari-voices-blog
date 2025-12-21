
import React from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel } from '../ui';
import { Bookmark } from 'lucide-react';

interface BookmarkedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
}

interface BookmarkedPostsProps {
  posts: BookmarkedPost[];
}

export const BookmarkedPosts: React.FC<BookmarkedPostsProps> = ({ posts }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Bookmark /> Bookmarked Stories
      </h2>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link to={`/posts/${post.slug}`} key={post.id}>
              <GlassPanel className="p-6 h-full hover:bg-surface/20 transition-colors duration-300 transform hover:-translate-y-1">
                <h3 className="font-semibold text-lg text-white mb-2">{post.title}</h3>
                <p className="text-surface/70 text-sm line-clamp-3">{post.excerpt}</p>
              </GlassPanel>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-surface/60 text-sm">You haven't bookmarked any stories yet.</p>
      )}
    </div>
  );
};
