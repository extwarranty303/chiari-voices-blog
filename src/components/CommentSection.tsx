import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CommentInput from './CommentInput';
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  text: string;
  createdAt: Timestamp;
  upvotes: number;
  downvotes: number;
  parentId: string | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const Comment = ({ comment, onReply, onVote }: { comment: Comment, onReply: (id: string, text: string) => void, onVote: (id: string, type: 'up' | 'down') => void }) => {
    const [showReply, setShowReply] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex gap-3 my-4">
            <img src={comment.authorPhotoURL || '/default-avatar.png'} alt={comment.authorName} className="w-8 h-8 rounded-full mt-1" />
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-surface">{comment.authorName}</span>
                    <span className="text-xs text-surface/60">{new Date(comment.createdAt?.toDate()).toLocaleString()}</span>
                </div>
                <p className="text-surface/90 mt-1">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-surface/60">
                    <button onClick={() => onVote(comment.id, 'up')} className="flex items-center gap-1 hover:text-accent transition-colors"><ArrowUp size={14}/> {comment.upvotes}</button>
                    <button onClick={() => onVote(comment.id, 'down')} className="flex items-center gap-1 hover:text-red-400 transition-colors"><ArrowDown size={14}/> {comment.downvotes}</button>
                    <button onClick={() => setShowReply(!showReply)} className="flex items-center gap-1 hover:text-accent transition-colors"><MessageSquare size={14}/> Reply</button>
                </div>
                {showReply && user && (
                    <div className="mt-3">
                        <CommentInput 
                            onSubmit={async (text) => { 
                                await onReply(comment.id, text); 
                                setShowReply(false); 
                            }} 
                            buttonText="Post Reply" 
                            onCancel={() => setShowReply(false)}
                        />
                    </div>
                )}
                 {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-surface/10">
                        {comment.replies.map(reply => 
                            <Comment key={reply.id} comment={reply} onReply={onReply} onVote={onVote} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user, loading } = useAuth();

  const fetchComments = useCallback(async () => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
    
    const commentMap = new Map(fetchedComments.map(c => [c.id, {...c, replies: [] as Comment[]} ]));
    const nestedComments: Comment[] = [];

    fetchedComments.forEach(comment => {
        if (comment.parentId && commentMap.has(comment.parentId)) {
            commentMap.get(comment.parentId)!.replies!.push(commentMap.get(comment.id)!);
        } else {
            nestedComments.push(commentMap.get(comment.id)!);
        }
    });

    setComments(nestedComments);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = useCallback(async (text: string, parentId: string | null = null) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(db, "posts", postId, "comments"), {
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || '',
      text,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      parentId,
    });
    fetchComments();
  }, [user, postId, fetchComments]);

  const handleVote = useCallback(async (commentId: string, type: 'up' | 'down') => {
    if (!user) return alert("Please sign in to vote.");
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentRef, {
        [type === 'up' ? 'upvotes' : 'downvotes']: increment(1)
    });
    fetchComments();
  }, [user, postId, fetchComments]);

  return (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-surface mb-6">Comments</h2>
        <div className="mb-8">
            <CommentInput onSubmit={(text) => handlePostComment(text)} />
        </div>
        {loading ? (
            <p className="text-center text-surface/60 py-8">Loading comments...</p>
        ) : comments.length > 0 ? (
            <div>
                {comments.map(comment => 
                    <Comment key={comment.id} comment={comment} onReply={(parentId, text) => handlePostComment(text, parentId)} onVote={handleVote}/>
                )}
            </div>
        ) : (
            <p className="text-center text-surface/60 py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
    </div>
  );
}
