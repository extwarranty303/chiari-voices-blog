import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';
import { Button } from '../ui/Button';
import { Loader2, FileText } from 'lucide-react';

interface DocumentImporterProps {
  onImport: (htmlContent: string) => void;
}

export const DocumentImporter: React.FC<DocumentImporterProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value) {
        onImport(result.value);
      }
    } catch (error) {
      console.error("Error importing document:", error);
      alert("Failed to import document. Please ensure it is a valid .docx file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".docx"
        className="hidden"
      />
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <FileText className="mr-2" size={14} />}
        Import Doc
      </Button>
    </div>
  );
};
