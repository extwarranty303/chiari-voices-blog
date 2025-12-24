import { useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { format } from 'date-fns';
import { GlassPanel, Button } from './ui';
import { X, Clock, User as UserIcon, Calendar, Tag } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface PostPreviewData {
    title: string;
    content: string;
    authorName?: string;
    createdAt?: Timestamp;
    tags?: string[];
    readTime?: number;
    imageUrl?: string;
}

interface PostPreviewProps {
    postData: PostPreviewData;
    onClose: () => void;
}

export default function PostPreview({ postData, onClose }: PostPreviewProps) {
    const sanitizedPostContent = useMemo(() => {
        return DOMPurify.sanitize(postData.content, {
            ALLOWED_TAGS: [
                'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 
                'span', 'div', 'pre', 'code'
            ],
            ALLOWED_ATTR: [
                'href', 'target', 'src', 'alt', 'class', 'style', 'title'
            ]
        });
    }, [postData.content]);

    useEffect(() => {
        if (sanitizedPostContent) {
            const previewContent = document.getElementById('preview-content');
            if (previewContent) {
                previewContent.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block as HTMLElement);
                });
            }
        }
    }, [sanitizedPostContent]);


    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-2xl w-full max-w-5xl h-[90vh] relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border/10">
                    <h2 className="text-xl font-bold">Post Preview</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X />
                    </Button>
                </div>
                <div className="overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-surface/10">
                    <div className="max-w-4xl mx-auto">
                        <article>
                            <header className="mb-8">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-surface leading-tight mb-3">{postData.title}</h1>
                                {postData.readTime && (
                                    <div className="flex items-center gap-2 text-muted text-sm mt-4">
                                        <Clock size={16} />
                                        <span>{postData.readTime} min read</span>
                                    </div>
                                )}
                            </header>

                            <GlassPanel className="p-12">
                                <div className="flex items-center justify-between text-muted border-b border-border/10 pb-4 mb-8">
                                    <div className="flex items-center gap-6">
                                      <span className="flex items-center gap-2 text-surface/80">
                                        <UserIcon size={18} />
                                        <span className="font-medium">{postData.authorName || 'Chiari Voices Admin'}</span>
                                      </span>
                                      <span className="flex items-center gap-2 text-surface/60">
                                        <Calendar size={18} />
                                        <span>{postData.createdAt?.seconds ? format(new Date(postData.createdAt.seconds * 1000), 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy')}</span>
                                      </span>
                                    </div>
                                </div>

                                {postData.imageUrl && <img src={postData.imageUrl} alt={postData.title} className="w-full h-auto object-cover rounded-xl mb-8" />}

                                <div
                                    id="preview-content"
                                    className="prose prose-invert prose-lg max-w-none mx-auto text-surface/90"
                                    dangerouslySetInnerHTML={{ __html: sanitizedPostContent }}
                                ></div>

                                {postData.tags && postData.tags.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-border/10 flex flex-wrap items-center gap-3">
                                        <span className="font-semibold text-surface"><Tag size={16} /></span>
                                        {postData.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 text-sm rounded-full bg-accent/10 text-accent">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </GlassPanel>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
}
