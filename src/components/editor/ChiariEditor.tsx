import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toolbar } from './Toolbar';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from './FontSize';
import { Indent } from './Indent';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import React, { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Input, Textarea, Label } from '../ui';
import { DocumentImporter } from './DocumentImporter';
import { uploadImage } from './ImageUpload';

interface ChiariEditorProps {
    content: string;
    setContent: (value: string) => void;
    onSave: () => void;
    title: string;
    status: 'published' | 'draft' | 'archived';
    tags: string[];
    metaTitle: string;
    metaDescription: string;
    slug: string;
    primaryKeyword: string;
    secondaryKeywords: string;
    setTitle: (value: string) => void;
    setStatus: (value: 'published' | 'draft' | 'archived') => void;
    setTags: (value: string[]) => void;
    setMetaTitle: (value: string) => void;
    setMetaDescription: (value: string) => void;
    setSlug: (value: string) => void;
    setPrimaryKeyword: (value: string) => void;
    setSecondaryKeywords: Dispatch<SetStateAction<string>>;
}

const ChiariEditor: React.FC<ChiariEditorProps> = ({ 
    content, setContent, onSave, 
    title, setTitle,
    status, setStatus,
    tags, setTags,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    slug, setSlug,
    primaryKeyword, setPrimaryKeyword,
    secondaryKeywords, setSecondaryKeywords
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            Underline,
            TextStyle,
            FontSize,
            Indent,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-accent underline cursor-pointer' },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Color,
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
            CharacterCount,
            Placeholder.configure({
                placeholder: 'Share your story with the world...',
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: { class: 'rounded-xl shadow-lg max-w-full' },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px]',
            },
        },
    });

    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
             if (Math.abs(editor.getHTML().length - content.length) > 20 || content === '') {
                 editor.commands.setContent(content);
             }
        }
    }, [content, editor]);

    const handleImport = (html: string) => {
        if (editor) {
            editor.commands.setContent(html);
            setContent(html);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editor) return;

        try {
            const downloadUrl = await uploadImage(file);
            editor.chain().focus().setImage({ src: downloadUrl }).run();
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <div className="space-y-4">
                    <Input 
                        label="Post Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter post title" 
                        required 
                        className="bg-slate-900 border-slate-700"
                    />
                    
                     <div className="flex flex-col gap-1.5">
                        <Label>Status</Label>
                        <select 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                            value={status} 
                            onChange={(e) => setStatus(e.target.value as any)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <Input 
                        label="Tags (comma separated)" 
                        value={tags.join(', ')} 
                        onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))} 
                        placeholder="health, wellness, chiari" 
                        className="bg-slate-900 border-slate-700"
                    />
                </div>

                 <div className="space-y-4">
                    <Input 
                        label="Slug (URL)" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        placeholder="post-url-slug" 
                        className="bg-slate-900 border-slate-700"
                    />
                     <Input 
                        label="Meta Title" 
                        value={metaTitle} 
                        onChange={(e) => setMetaTitle(e.target.value)} 
                        placeholder="SEO Title" 
                        className="bg-slate-900 border-slate-700"
                    />
                </div>
            </div>

            <div className="space-y-4 text-white">
                <Textarea 
                    label="Meta Description" 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)} 
                    placeholder="Brief description for search engines" 
                    rows={3}
                    className="bg-slate-900 border-slate-700"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Primary Keyword" 
                        value={primaryKeyword} 
                        onChange={(e) => setPrimaryKeyword(e.target.value)} 
                        placeholder="Main focus keyword" 
                        className="bg-slate-900 border-slate-700"
                    />
                     <Input 
                        label="Secondary Keywords (comma separated)" 
                        value={secondaryKeywords} 
                        onChange={(e) => setSecondaryKeywords(e.target.value)} 
                        placeholder="related, keywords, here" 
                        className="bg-slate-900 border-slate-700"
                    />
                </div>
            </div>

            <div className="border border-slate-700 rounded-xl relative overflow-hidden bg-slate-950/30">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex flex-wrap justify-between items-center p-2 border-b border-slate-700 bg-slate-950 shadow-lg">
                    <Toolbar editor={editor} addImage={triggerImageUpload} />
                    <div className="hidden sm:block px-2">
                        <DocumentImporter onImport={handleImport} />
                    </div>
                </div>
                <div className="p-2 sm:p-6 bg-slate-950/20 min-h-[600px]">
                    <EditorContent editor={editor} />
                </div>
                
                {/* Editor Footer / Info */}
                <div className="p-3 border-t border-slate-700 bg-slate-950 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <div>{editor?.storage.characterCount.words()} Words</div>
                    <div>{editor?.storage.characterCount.characters()} Characters</div>
                </div>
            </div>
            
             <div className="flex justify-end gap-4 pb-12">
                 <button 
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-accent text-white hover:bg-accent/90 h-10 px-8 shadow-lg shadow-accent/20 active:scale-95"
                 >
                    Save Changes
                 </button>
             </div>
        </div>
    );
};

export default ChiariEditor;
