
import { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Link as LinkIcon, List, ListOrdered, Quote, Heading2 } from 'lucide-react';
import { Button } from './ui';
import '../styles/tiptap.css';

interface TiptapToolbarProps {
    editor: Editor | null;
}

const TiptapToolbar = ({ editor }: TiptapToolbarProps) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      <Button type="button" variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Button>
      <Button type="button" variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Button>
      <Button type="button" variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Button>
      <Button type="button" variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Button>
      <Button type="button" variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Button>
      <Button type="button" variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Button>
      <Button type="button" variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Button>
      <Button type="button" variant={'ghost'} size="icon" onClick={setLink}><LinkIcon size={16} /></Button>
    </div>
  );
};

interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none p-4',
        },
    }
  });
  
  // Update editor content when external value changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div className="tiptap-editor-container">
        <TiptapToolbar editor={editor} />
        <EditorContent editor={editor} />
    </div>
  );
}
