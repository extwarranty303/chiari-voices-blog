
import { type Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Code, Image as ImageIcon, Minus, Plus } from 'lucide-react';
import { Toggle } from '../ui/toggle';
import { Button } from '../ui/Button';

interface ToolbarProps {
  editor: Editor | null;
  addImage?: () => void;
}

export const Toolbar = ({ editor, addImage }: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
  };

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16'; // Default 16px

  const adjustFontSize = (amount: number) => {
      const current = parseInt(currentFontSize.replace('px', ''));
      const newSize = current + amount;
      if (newSize > 0) {
          setFontSize(`${newSize}px`);
      }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap p-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        title="Strike"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      
      <div className="w-px h-6 bg-surface/10 mx-1" />
      
      {/* Font Size Controls */}
      <div className="flex items-center gap-1 bg-surface/5 rounded-md px-1 border border-surface/10 h-8">
          <button 
            type="button"
            onClick={() => adjustFontSize(-1)}
            className="p-1 hover:bg-surface/10 rounded transition-colors text-surface/70 hover:text-surface"
            title="Decrease font size"
          >
              <Minus className="h-3 w-3" />
          </button>
          <span className="text-[11px] font-mono w-6 text-center text-accent font-bold">{currentFontSize.replace('px','')}</span>
          <button 
            type="button"
            onClick={() => adjustFontSize(1)}
            className="p-1 hover:bg-surface/10 rounded transition-colors text-surface/70 hover:text-surface"
            title="Increase font size"
          >
              <Plus className="h-3 w-3" />
          </button>
      </div>

      <div className="w-px h-6 bg-surface/10 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <div className="w-px h-6 bg-surface/10 mx-1" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Toggle>
      {addImage && (
        <>
            <div className="w-px h-6 bg-surface/10 mx-1" />
            <Button 
                size="sm" 
                variant="ghost" 
                onClick={addImage} 
                title="Upload Image"
                className="h-8 w-8 p-0 text-surface/70 hover:text-surface hover:bg-surface/10"
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
        </>
      )}
    </div>
  );
};
