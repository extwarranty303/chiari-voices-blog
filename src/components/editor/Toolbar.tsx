
import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Heading1, Heading2, Heading3, 
  Image as ImageIcon, Minus, Plus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Indent as IndentIcon, Outdent as OutdentIcon,
  Link as LinkIcon, Highlighter, CheckSquare,
  Subscript as SubIcon, Superscript as SuperIcon,
  Quote, Undo, Redo
} from 'lucide-react';
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

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16';

  const adjustFontSize = (amount: number) => {
      const current = parseInt(currentFontSize.replace('px', ''));
      const newSize = current + amount;
      if (newSize > 0) {
          setFontSize(`${newSize}px`);
      }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-1 flex-wrap p-1 max-w-4xl">
      {/* History */}
      <div className="flex items-center gap-0.5 mr-2">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={14}/></Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={14}/></Button>
      </div>

      <div className="w-px h-6 bg-slate-800 mx-1" />

      {/* Text Style Group */}
      <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><Underline className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Strike"><Strikethrough className="h-4 w-4" /></Toggle>
      
      <div className="w-px h-6 bg-slate-800 mx-1" />
      
      {/* Font Size */}
      <div className="flex items-center gap-1 bg-slate-900 rounded-md px-1 border border-slate-800 h-8">
          <button type="button" onClick={() => adjustFontSize(-1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Minus className="h-3 w-3" /></button>
          <span className="text-[10px] font-mono w-5 text-center text-accent font-bold">{currentFontSize.replace('px','')}</span>
          <button type="button" onClick={() => adjustFontSize(1)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><Plus className="h-3 w-3" /></button>
      </div>

      <div className="w-px h-6 bg-slate-800 mx-1" />

      {/* Headings */}
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3"><Heading3 className="h-4 w-4" /></Toggle>
      
      <div className="w-px h-6 bg-slate-800 mx-1" />

      {/* Alignment */}
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} title="Align Justify"><AlignJustify className="h-4 w-4" /></Toggle>

      <div className="w-px h-6 bg-slate-800 mx-1" />

      {/* Lists & Indents */}
      <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('taskList')} onPressedChange={() => editor.chain().focus().toggleTaskList().run()} title="Task List"><CheckSquare className="h-4 w-4" /></Toggle>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().indent().run()} title="Indent"><IndentIcon size={14}/></Button>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().outdent().run()} title="Outdent"><OutdentIcon size={14}/></Button>

      <div className="w-px h-6 bg-slate-800 mx-1" />

      {/* Extras */}
      <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={addLink} title="Add Link"><LinkIcon className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('highlight')} onPressedChange={() => editor.chain().focus().toggleHighlight().run()} title="Highlight"><Highlighter className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('subscript')} onPressedChange={() => editor.chain().focus().toggleSubscript().run()} title="Subscript"><SubIcon className="h-4 w-4" /></Toggle>
      <Toggle size="sm" pressed={editor.isActive('superscript')} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript"><SuperIcon className="h-4 w-4" /></Toggle>

      {addImage && (
        <>
            <div className="w-px h-6 bg-slate-800 mx-1" />
            <Button size="sm" variant="ghost" onClick={addImage} title="Upload Image" className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-800"><ImageIcon className="h-4 w-4" /></Button>
        </>
      )}
    </div>
  );
};
