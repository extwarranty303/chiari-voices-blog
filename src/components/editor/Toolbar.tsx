import React from 'react';
import type { Editor } from '@tiptap/react';
import { Toggle } from '../ui';
import Icon from './Icon';

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
            <Toggle size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || isSourceMode}><Icon name="Undo" size={16} /></Toggle>
            <Toggle size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || isSourceMode}><Icon name="Redo" size={16} /></Toggle>
            
            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Headings */}
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={isSourceMode}><Icon name="Heading1" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={isSourceMode}><Icon name="Heading2" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={isSourceMode}><Icon name="Heading3" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} disabled={isSourceMode}><Icon name="Pilcrow" size={16} /></Toggle>

             <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Styling */}
            <Toggle size="sm" pressed={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} disabled={isSourceMode}><Icon name="Bold" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={isSourceMode}><Icon name="Italic" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={isSourceMode}><Icon name="Underline" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} disabled={isSourceMode}><Icon name="Strikethrough" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} disabled={isSourceMode}><Icon name="Highlighter" size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Lists & Quote */}
            <Toggle size="sm" pressed={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={isSourceMode}><Icon name="List" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={isSourceMode}><Icon name="ListOrdered" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={isSourceMode}><Icon name="Quote" size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Alignment */}
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={isSourceMode}><Icon name="AlignLeft" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={isSourceMode}><Icon name="AlignCenter" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={isSourceMode}><Icon name="AlignRight" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} disabled={isSourceMode}><Icon name="AlignJustify" size={16} /></Toggle>

            <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Indentation */}
            <Toggle size="sm" onClick={() => editor.chain().focus().indent().run()} disabled={!editor.can().indent() || isSourceMode}><Icon name="Indent" size={16} /></Toggle>
            <Toggle size="sm" onClick={() => editor.chain().focus().outdent().run()} disabled={!editor.can().outdent() || isSourceMode}><Icon name="Outdent" size={16} /></Toggle>
            
            <div className="w-px h-6 bg-slate-600 mx-1" />

             {/* Font Size & Color */}
            <Toggle size="sm" onClick={() => setFontSize(parseInt(editor.getAttributes('textStyle').fontSize || '16') + 2)} disabled={isSourceMode}><Icon name="Baseline" size={16} className="h-4 w-4" />+</Toggle>
            <Toggle size="sm" onClick={() => setFontSize(parseInt(editor.getAttributes('textStyle').fontSize || '16') - 2)} disabled={isSourceMode}><Icon name="Baseline" size={16} className="h-4 w-4" />-</Toggle>
            <div className="relative">
                <input type="color" value={currentColor} onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} className="w-6 h-6 rounded border-none bg-transparent absolute opacity-0 cursor-pointer" disabled={isSourceMode} />
                <Icon name="Palette" size={16} style={{ color: currentColor }} />
            </div>

             <div className="w-px h-6 bg-slate-600 mx-1" />

            {/* Advanced & Media */}
            <Toggle size="sm" onClick={addImage} disabled={isSourceMode}><Icon name="ImageIcon" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} disabled={isSourceMode}><Icon name="Subscript" size={16} /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} disabled={isSourceMode}><Icon name="Superscript" size={16} /></Toggle>
            <Toggle size="sm" pressed={isSourceMode} onClick={toggleSourceMode}><Icon name="FileCode" size={16} /></Toggle>
        </div>
    );
};
