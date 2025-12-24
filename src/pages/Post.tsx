import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Post as PostType } from '../types';

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostType | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        const postDoc = doc(db, 'posts', id);
        const postSnapshot = await getDoc(postDoc);
        if (postSnapshot.exists()) {
          setPost({ id: postSnapshot.id, ...postSnapshot.data() } as PostType);
        }
      }
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="mb-4 text-4xl font-bold text-white">{post.title}</h1>
        <div
          className="text-gray-300 prose prose-lg max-w-none prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
};

export default Post;
