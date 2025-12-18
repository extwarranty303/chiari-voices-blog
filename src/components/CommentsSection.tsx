import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Button, Input, GlassPanel } from './ui';
import { Send, Trash2, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  createdAt: any;
  parentId: string | null;
  reported?: boolean;
}

interface CommentProps {
  comment: Comment;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId: string | null;
  isAdminOrModerator: boolean;
}

const CommentItem: React.FC<CommentProps> = ({ comment, onReply, onDelete, currentUserId, isAdminOrModerator }) => {
    const [isReported, setIsReported] = useState(comment.reported || false);

    const handleReport = async () => {
        if (isReported) return;
        if (window.confirm("Are you sure you want to report this comment for review?")) {
            const commentRef = doc(db, 'comments', comment.id);
            await updateDoc(commentRef, { reported: true });
            setIsReported(true);
        }
    };

    return (
        <div className="flex items-start gap-4">
            <img src={comment.authorPhotoURL || '/default-avatar.png'} alt={comment.authorName} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{comment.authorName}</span>
                    <span className="text-xs text-surface/60">{formatDistanceToNow(new Date(comment.createdAt?.seconds * 1000), { addSuffix: true })}</span>
                </div>
                <p className="text-surface/80 mt-1">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                    <button onClick={() => onReply(comment.id)} className="text-accent hover:underline">Reply</button>
                    {(isAdminOrModerator || currentUserId === comment.authorId) && (
                        <button onClick={() => onDelete(comment.id)} className="text-red-400 hover:underline">Delete</button>
                    )}
                    {currentUserId && !isReported && (
                        <button onClick={handleReport} className="text-surface/50 hover:text-yellow-400 flex items-center gap-1">
                            <Flag size={12} /> Report
                        </button>
                    )}
                    {isReported && <span className="text-yellow-400 text-xs">Reported</span>}
                </div>
            </div>
        </div>
    );
};


export default function CommentsSection({ postId }: { postId: string }) {
  const { currentUser, isAdmin, isModerator } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [postId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    await addDoc(collection(db, 'comments'), {
      postId,
      text: newComment,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonymous',
      authorPhotoURL: currentUser.photoURL || '',
      createdAt: serverTimestamp(),
      parentId: replyingTo,
      reported: false,
    });

    setNewComment('');
    setReplyingTo(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
        await deleteDoc(doc(db, 'comments', commentId));
    }
  };
  
  const buildCommentTree = (commentList: Comment[], parentId: string | null = null): JSX.Element[] => {
    return commentList
      .filter(comment => comment.parentId === parentId)
      .map(comment => (
        <div key={comment.id} className={parentId ? 'ml-8 mt-4 border-l-2 border-surface/10 pl-4' : 'mt-6'}>
          <CommentItem 
            comment={comment} 
            onReply={setReplyingTo} 
            onDelete={handleDeleteComment} 
            currentUserId={currentUser?.uid || null}
            isAdminOrModerator={isAdmin || isModerator}
          />
          {buildCommentTree(commentList, comment.id)}
          {replyingTo === comment.id && (
            <div className="mt-4 ml-8">
              <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={`Replying to ${comment.authorName}...`} />
              <div className="flex gap-2 mt-2">
                <Button onClick={handlePostComment} size="sm">Post Reply</Button>
                <Button onClick={() => setReplyingTo(null)} size="sm" variant="ghost">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      ));
  };

  return (
    <GlassPanel>
      <h3 className="text-2xl font-bold text-white mb-6">{comments.length} Comment{comments.length !== 1 && 's'}</h3>
      {currentUser ? (
        !replyingTo && (
            <div className="flex gap-4 items-start">
              <img src={currentUser.photoURL || '/default-avatar.png'} alt={currentUser.displayName || ''} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Join the discussion..." />
                <Button onClick={handlePostComment} className="mt-2" size="sm" disabled={!newComment.trim()}>
                    <Send size={14} /> Post Comment
                </Button>
              </div>
            </div>
        )
      ) : (
        <p className="text-surface/60">Please log in to post a comment.</p>
      )}

      <div>
        {buildCommentTree(comments)}
      </div>
    </GlassPanel>
  );
}
