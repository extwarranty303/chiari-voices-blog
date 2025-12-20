import { useState } from 'react';
import { Button, Textarea } from './ui';
import { useAuth } from '../context/AuthContext';

interface CommentInputProps {
  onSubmit: (text: string) => Promise<void>;
  initialText?: string;
  buttonText?: string;
  onCancel?: () => void;
}

export default function CommentInput({ onSubmit, initialText = '', buttonText = 'Post Comment', onCancel }: CommentInputProps) {
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            required
            rows={3}
            disabled={!user}
        />
        <div className="flex justify-end gap-2">
            {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
            <Button type="submit" disabled={isSubmitting || !text.trim()}>
                {isSubmitting ? 'Posting...' : buttonText}
            </Button>
        </div>
    </form>
  );
}
