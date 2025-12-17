import { Editor } from '@tinymce/tinymce-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Your public API key
const TINYMCE_API_KEY = '42hywlzjyvoo3tuf9znbap1bm1lljzz307wqb51fltlkwu6f';

export default function MyEditor({ value, onChange }: EditorProps) {
  return (
    <Editor
      apiKey={TINYMCE_API_KEY}
      init={{
        height: 500,
        menubar: true,
        plugins: [
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
            'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'ai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #F8FAFC; }', // Set text color for dark mode
        skin: 'oxide-dark',
        content_css: 'dark',
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Author name',
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (_request: any, respondWith: any) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
        uploadcare_public_key: 'b72e3680f4a6ea692f93',
      }}
      value={value}
      onEditorChange={onChange}
    />
  );
}
