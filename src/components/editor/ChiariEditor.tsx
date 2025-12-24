import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toolbar } from './Toolbar';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import { FontSize } from './FontSize';
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
            StarterKit, 
            Underline,
            TextStyle,
            FontSize,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
            },
        },
    });

    // Update editor content when props change (e.g. initial load or external update)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
             if (Math.abs(editor.getHTML().length - content.length) > 10 || content === '') {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Input 
                        label="Post Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Enter post title" 
                        required 
                    />
                    
                     <div className="flex flex-col gap-1.5">
                        <Label>Status</Label>
                        <select 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    />
                </div>

                 <div className="space-y-4">
                    <Input 
                        label="Slug (URL)" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        placeholder="post-url-slug" 
                    />
                     <Input 
                        label="Meta Title" 
                        value={metaTitle} 
                        onChange={(e) => setMetaTitle(e.target.value)} 
                        placeholder="SEO Title" 
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Textarea 
                    label="Meta Description" 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)} 
                    placeholder="Brief description for search engines" 
                    rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label="Primary Keyword" 
                        value={primaryKeyword} 
                        onChange={(e) => setPrimaryKeyword(e.target.value)} 
                        placeholder="Main focus keyword" 
                    />
                     <Input 
                        label="Secondary Keywords (comma separated)" 
                        value={secondaryKeywords} 
                        onChange={(e) => setSecondaryKeywords(e.target.value)} 
                        placeholder="related, keywords, here" 
                    />
                </div>
            </div>

            <div className="border rounded-md relative">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex justify-between items-center p-2 border-b bg-surface/95 backdrop-blur-sm shadow-sm rounded-t-md">
                    <Toolbar editor={editor} addImage={triggerImageUpload} />
                    <DocumentImporter onImport={handleImport} />
                </div>
                <div className="p-4 bg-background min-h-[400px]">
                    <EditorContent editor={editor} />
                </div>
            </div>
            
             <div className="flex justify-end gap-4">
                 <button 
                    type="button"
                    onClick={onSave}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                 >
                    Save Post
                 </button>
             </div>
        </div>
    );
};

export default ChiariEditor;
