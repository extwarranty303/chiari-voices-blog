import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, List, ListOrdered, Quote, Code, Image as ImageIcon, Heading2 } from 'lucide-react';
import { Button, Textarea } from './ui';

interface TiptapToolbarProps {
    editor: Editor | null;
    onImageUpload: () => void;
    onLink: () => void;
    isSourceView: boolean;
}

const TiptapToolbar = ({ editor, onImageUpload, onLink, isSourceView }: TiptapToolbarProps) => {
  if (!editor || isSourceView) return null;

  return (
    <div className="flex flex-wrap items-center p-2 bg-surface/5 border-b border-accent/20 rounded-t-lg gap-1">
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Button>
      <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Button>
      <Button variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Button>
      <Button variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Button>
      <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Button>
      <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Button>
      <Button variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Button>
      <Button variant={'ghost'} size="icon" onClick={onLink}><LinkIcon size={16} /></Button>
      <Button variant={'ghost'} size="icon" onClick={onImageUpload}><ImageIcon size={16} /></Button>
    </div>
  );
};

interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const [isSourceView, setIsSourceView] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
      Image.configure({ inline: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isSourceView) onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-invert min-h-[500px] p-4 outline-none max-w-full',
        },
    }
  });

  useEffect(() => {
    if (editor && !isSourceView) {
        editor.commands.setContent(value);
    }
  }, [isSourceView, editor, value]);

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
  }
  
  const addImage = useCallback(() => {
    const url = window.prompt('URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor]);

  return (
    <div className="editor-container bg-surface/10 rounded-lg border border-accent/20">
        <div className="flex justify-between items-center pr-2 border-b border-accent/20">
            <TiptapToolbar editor={editor} onImageUpload={addImage} onLink={setLink} isSourceView={isSourceView} />
            <Button variant={isSourceView ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsSourceView(!isSourceView)}><Code size={16} /> Source</Button>
        </div>
        {isSourceView ? (
            <Textarea 
                value={value} 
                onChange={handleSourceChange} 
                className="w-full h-full min-h-[500px] p-4 bg-transparent border-0 rounded-none font-mono text-sm resize-none"
                placeholder="Enter HTML content..."
            />
        ) : (
            <EditorContent editor={editor} />
        )}
    </div>
  );
}
