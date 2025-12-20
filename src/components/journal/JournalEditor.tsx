import { Editor } from '@tinymce/tinymce-react';

interface JournalEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
}

export function JournalEditor({ initialValue, onSave }: JournalEditorProps) {
  return (
    <Editor
      apiKey="42hywlzjyvoo3tuf9znbap1bm1lljzz307wqb51fltlkwu6f" // Replace with your TinyMCE API key
      initialValue={initialValue}
      init={{
        skin: 'oxide-dark',
        content_css: 'dark',
        height: 500,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount autosave'
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help',
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      }}
      onSaveContent={(content) => onSave(content)}
    />
  );
}
