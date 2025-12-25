import React from 'react';
import DOMPurify from 'dompurify';
import type { Post } from '../lib/types';

interface PostPreviewProps {
    postData: Partial<Post>;
    onClose: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ postData, onClose }) => {
    const sanitizedContent = DOMPurify.sanitize(postData.content || '', {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class'],
        // Allow all classes and styles
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        FORBID_TAGS: [],
        FORBID_ATTR: [],
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] p-4 sm:p-8 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-90 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Post Preview</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">&times; Close</button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 sm:p-10">
                    {postData.imageUrl && (
                        <img src={postData.imageUrl} alt={postData.title} className="w-full h-64 object-cover rounded-xl mb-8 shadow-lg" />
                    )}
                    <article className="prose prose-invert lg:prose-xl mx-auto">
                        <h1>{postData.title}</h1>
                        <div className="text-sm text-slate-400 mb-4">
                            <span>{postData.readTime} min read</span>
                            {postData.tags && postData.tags.length > 0 && (
                                <span className="ml-4">{postData.tags.join(', ')}</span>
                            )}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    </article>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
