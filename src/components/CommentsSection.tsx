import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { GlassPanel, Button } from './ui';
import { MessageSquare, Heart, User as UserIcon, Smile } from 'lucide-react';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
  likes: string[]; // Array of user IDs
  replyCount?: number;
}

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      where('postId', '==', postId),
      orderBy('createdAt', 'asc') // Fetch all, then organize client-side for threading
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    });

    return unsubscribe;
  }, [postId]);

  const handleSubmit = async (parentId: string | null = null, content: string = newComment) => {
    if (!currentUser || !content.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        parentId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userAvatar: currentUser.photoURL,
        content: content.trim(),
        createdAt: serverTimestamp(),
        likes: []
      });

      if (parentId) {
        setReplyTo(null);
      } else {
        setNewComment('');
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleLike = async (commentId: string, currentLikes: string[]) => {
    if (!currentUser) return;

    const commentRef = doc(db, 'comments', commentId);
    const isLiked = currentLikes.includes(currentUser.uid);

    try {
      await updateDoc(commentRef, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Organize comments into threads
  const rootComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const replies = getReplies(comment.id);
    const [replyContent, setReplyContent] = useState('');
    const [localShowEmoji, setLocalShowEmoji] = useState(false);
    const isLiked = currentUser && comment.likes?.includes(currentUser.uid);

    return (
      <div className={`flex gap-3 mb-4 ${depth > 0 ? 'ml-6 md:ml-12 border-l-2 border-surface/10 pl-4' : ''}`}>
        <div className="shrink-0">
          {comment.userAvatar ? (
            <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface/10 flex items-center justify-center">
              <UserIcon size={14} className="text-surface/60" />
            </div>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="bg-surface/5 rounded-lg p-3 relative group">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white">{comment.userName}</span>
              <span className="text-xs text-surface/40">
                {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
              </span>
            </div>
            <p className="text-surface/80 text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-1 ml-1">
            <button 
              onClick={() => handleLike(comment.id, comment.likes || [])}
              className={`text-xs flex items-center gap-1 hover:text-red-400 transition-colors ${isLiked ? 'text-red-400' : 'text-surface/40'}`}
            >
              <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
              {comment.likes?.length || 0}
            </button>
            
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-xs flex items-center gap-1 text-surface/40 hover:text-accent transition-colors"
            >
              <MessageSquare size={12} /> Reply
            </button>
          </div>

          {/* Reply Input */}
          {replyTo === comment.id && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                   <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.userName}...`}
                    className="w-full bg-black/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/50"
                    autoFocus
                  />
                   <button 
                    type="button"
                    onClick={() => setLocalShowEmoji(!localShowEmoji)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-surface/40 hover:text-accent"
                  >
                    <Smile size={16} />
                  </button>
                   {localShowEmoji && (
                      <div className="absolute right-0 bottom-full mb-2 z-10">
                        <EmojiPicker 
                          onEmojiClick={(emoji) => {
                            setReplyContent(prev => prev + emoji.emoji);
                            setLocalShowEmoji(false);
                          }} 
                          theme={Theme.DARK} 
                          width={300} 
                          height={400}
                        />
                      </div>
                    )}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    handleSubmit(comment.id, replyContent);
                    setReplyContent('');
                  }}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {/* Recursive Replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 pt-8 border-t border-surface/10">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        Discussion <span className="text-sm font-normal text-surface/40 bg-surface/5 px-2 py-0.5 rounded-full">{comments.length}</span>
      </h3>

      {/* Main Comment Input */}
      {currentUser ? (
        <div className="mb-8 flex gap-4">
          <div className="shrink-0">
             {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface/10 flex items-center justify-center">
                  <UserIcon size={20} className="text-surface/60" />
                </div>
              )}
          </div>
          <div className="flex-grow space-y-2">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full h-24 bg-black/20 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              />
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 bottom-3 text-surface/40 hover:text-accent transition-colors"
              >
                <Smile size={20} />
              </button>
              {showEmojiPicker && (
                <div className="absolute right-0 top-full mt-2 z-10 shadow-xl">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick} 
                    theme={Theme.DARK} 
                    width={300} 
                    height={400}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => handleSubmit(null)} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <GlassPanel className="text-center py-6 mb-8">
          <p className="text-surface/60 mb-3">Join the conversation</p>
          <Button variant="outline" onClick={() => window.location.href='/login'}>
            Log In to Comment
          </Button>
        </GlassPanel>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-surface/40 py-4">Loading comments...</div>
        ) : rootComments.length > 0 ? (
          rootComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center text-surface/40 py-8 italic">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
