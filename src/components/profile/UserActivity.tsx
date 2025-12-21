
import React from 'react';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  createdAt: Date;
}

interface UserActivityProps {
  comments: Comment[];
}

export const UserActivity: React.FC<UserActivityProps> = ({ comments }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">My Activity</h2>
      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-300">{comment.content}</p>
              <div className="text-xs text-gray-500 mt-2">
                <span>Commented on </span>
                <Link to={`/posts/${comment.postId}`} className="text-purple-400 hover:underline">
                  {comment.postTitle}
                </Link>
                <span> • {new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-surface/60 text-sm">You haven't made any comments yet.</p>
      )}
    </div>
  );
};
