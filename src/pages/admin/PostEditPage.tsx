
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, where, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import PostEditor from '../../components/PostEditor';
import type { Post } from '../../lib/types';

const PostEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        setLoading(true);
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const postDoc = querySnapshot.docs[0];
          setPost({ id: postDoc.id, ...postDoc.data() } as Post);
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      };
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const handleSave = (savedPost: Post) => {
    // After saving, you might want to redirect the user
    // For a new post, the slug might have been generated, so we use the savedPost slug
    navigate(`/admin/posts/editor/${savedPost.slug}`);
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <PostEditor post={post} onClose={() => navigate('/admin/posts')} onSave={handleSave} />
  );
};

export default PostEditPage;
