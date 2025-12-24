import { Link } from 'react-router-dom';
import type { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const excerpt = post.content.substring(0, 150) + '...'; // Simple excerpt

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-cyan-400"><Link to={`/post/${post.slug}`}>{post.title}</Link></h2>
        <p className="text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: excerpt }} />
        <Link to={`/post/${post.slug}`} className="text-cyan-400 hover:underline font-semibold">Read more</Link>
      </div>
    </div>
  );
};

export default PostCard;
