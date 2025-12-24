import { useState } from 'react';
import { Button } from '../ui';

interface ImageUploadDialogProps {
  onInsert: (url: string) => void;
  onClose: () => void;
}

export const ImageUploadDialog = ({ onInsert, onClose }: ImageUploadDialogProps) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleInsert = () => {
    if (url) {
      onInsert(url);
    } else if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onInsert(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-bold mb-4">Add Image</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="image-url" className="block text-sm font-medium mb-1">Image URL</label>
            <input
              id="image-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-surface/10 p-2 rounded"
              placeholder="https://example.com/image.png"
            />
          </div>
          <div className="text-center text-sm text-surface/60">OR</div>
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium mb-1">Upload Image</label>
            <input
              id="image-upload"
              type="file"
              onChange={handleFileChange}
              className="w-full bg-surface/10 p-2 rounded"
              accept="image/*"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={handleInsert}>Insert</Button>
        </div>
      </div>
    </div>
  );
};