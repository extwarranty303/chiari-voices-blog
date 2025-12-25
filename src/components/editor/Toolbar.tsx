import React from 'react';
import type { Editor } from '@tiptap/react';
import { Toggle } from '../ui';
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, Pilcrow, Quote, List, ListOrdered, Subscript, Superscript, ImageIcon, Baseline, Indent, Outdent, AlignLeft, AlignCenter, AlignRight, AlignJustify, Highlighter, Palette, Undo, Redo, FileCode } from 'lucide-react';

interface ToolbarProps {
    editor: Editor | null;
    addImage: () => void;
    isSourceMode: boolean;
    toggleSourceMode: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor, addImage, isSourceMode, toggleSourceMode }) => {
    if (!editor) {
        return null;
    }

    const setFontSize = (size: number) => {
        editor.chain().focus().setFontSize(size + 'px').run();
    };

    const currentColor = editor.getAttributes('textStyle').color || '#ffffff';

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-900 rounded-lg border border-slate-700">
            {/* History */}
            <Toggle size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || isSourceMode}><Undo size={16} /></Toggle>
            <Toggle size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || isSourceMode}><Redo size={16} /></Toggle>
            
            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Headings */}
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={isSourceMode}><Heading1 size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={isSourceMode}><Heading2 size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={isSourceMode}><Heading3 size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} disabled={isSourceMode}><Pilcrow size={16} /></Toggle>

             <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Styling */}
            <Toggle size="sm" pressed={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} disabled={isSourceMode}><Bold size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={isSourceMode}><Italic size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={isSourceMode}><Underline size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} disabled={isSourceMode}><Strikethrough size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} disabled={isSourceMode}><Highlighter size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Lists & Quote */}
            <Toggle size="sm" pressed={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={isSourceMode}><List size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={isSourceMode}><ListOrdered size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={isSourceMode}><Quote size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Alignment */}
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={isSourceMode}><AlignLeft size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={isSourceMode}><AlignCenter size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={isSourceMode}><AlignRight size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} disabled={isSourceMode}><AlignJustify size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Indentation */}
            <Toggle size="sm" onClick={() => editor.chain().focus().indent().run()} disabled={!editor.can().indent() || isSourceMode}><Indent size={16} /></Toggle>
            <Toggle size="sm" onClick={() => editor.chain().focus().outdent().run()} disabled={!editor.can().outdent() || isSourceMode}><Outdent size={16} /></Toggle>
            
            <div className="w-px h-6 bg-slate-600 mx-1" />

             {/* Font Size & Color */}
            <Toggle size="sm" onClick={() => setFontSize(parseInt(editor.getAttributes('textStyle').fontSize || '16') + 2)} disabled={isSourceMode}><Baseline size={16} className="h-4 w-4" />+</Toggle>
            <Toggle size="sm" onClick={() => setFontSize(parseInt(editor.getAttributes('textStyle').fontSize || '16') - 2)} disabled={isSourceMode}><Baseline size={16} className="h-4 w-4" />-</Toggle>
            <div className="relative">
                <input type="color" value={currentColor} onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} className="w-6 h-6 rounded border-none bg-transparent absolute opacity-0 cursor-pointer" disabled={isSourceMode} />
                <Palette size={16} style={{ color: currentColor }} />
            </div>

             <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Advanced & Media */}
            <Toggle size="sm" onClick={addImage} disabled={isSourceMode}><ImageIcon size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} disabled={isSourceMode}><Subscript size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} disabled={isSourceMode}><Superscript size={16} /></Toggle>
            <Toggle size="sm" pressed={isSourceMode} onClick={toggleSourceMode}><FileCode size={16} /></Toggle>
        </div>
    );
};
