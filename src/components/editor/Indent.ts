import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Indent the line or sink list item
       */
      indent: () => ReturnType;
      /**
       * Outdent the line or lift list item
       */
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      minLevel: 0,
      maxLevel: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => parseInt(element.style.paddingLeft || '0', 10) / 40,
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {};
              }

              return {
                style: `padding-left: ${attributes.indent * 40}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;
        
        // Handle List Items (Sink)
        if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
            return editor.commands.sinkListItem('listItem') || editor.commands.sinkListItem('taskItem');
        }

        // Handle Paragraphs/Headings (Padding)
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = (node.attrs.indent || 0) + 1;
            if (indent <= this.options.maxLevel) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch, editor }) => {
        const { selection } = state;

        // Handle List Items (Lift)
        if (editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')) {
             return editor.commands.liftListItem('listItem') || editor.commands.liftListItem('taskItem');
        }

        // Handle Paragraphs/Headings (Padding)
        tr = tr.setSelection(selection);
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = (node.attrs.indent || 0) - 1;
            if (indent >= this.options.minLevel) {
              tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    };
  },
});
