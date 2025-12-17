import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import './editor.css'; // Custom overrides for glassmorphism

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const [showSource, setShowSource] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <div className="editor-container relative">
      <div className="flex justify-end mb-2">
         <button 
           type="button"
           onClick={() => setShowSource(!showSource)}
           className="text-xs text-accent hover:text-white transition-colors"
         >
           {showSource ? 'Show Visual Editor' : 'Show Source Code'}
         </button>
      </div>
      
      {showSource ? (
        <textarea
          className="w-full h-64 bg-black/20 text-surface/80 font-mono text-sm p-4 rounded-lg border border-surface/10 focus:outline-none focus:border-accent/50"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <ReactQuill 
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-black/10 rounded-lg text-surface"
        />
      )}
    </div>
  );
}
