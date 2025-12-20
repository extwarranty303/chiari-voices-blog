
import { Settings, BookOpen, BookOpenCheck, Shield, X } from 'lucide-react';
import { useSymptomSafe } from '../../hooks/useSymptomSafe';
import { useFont } from '../../hooks/useFont';
import { GlassPanel } from '../ui';
import { useState } from 'react';

export function FloatingAccessibilityMenu() {
  const { isSymptomSafe, toggleSymptomSafe } = useSymptomSafe();
  const { isDyslexicFont, toggleDyslexicFont } = useFont();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-50 bg-accent text-white p-3 rounded-l-lg shadow-lg"
        aria-label="Open Accessibility Menu"
      >
        <Settings size={24} />
      </button>
    )
  }

  return (
    <GlassPanel className="fixed top-1/2 right-0 -translate-y-1/2 z-50 flex flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Accessibility</h3>
        <button onClick={() => setIsOpen(false)} className="text-surface hover:text-white">
          <X size={20} />
        </button>
      </div>
      <button onClick={toggleDyslexicFont} className="flex items-center gap-3 text-surface hover:text-white transition-colors">
        {isDyslexicFont ? <BookOpenCheck size={20} /> : <BookOpen size={20} />}
        <span>{isDyslexicFont ? "Default Font" : "Dyslexic Font"}</span>
      </button>
      <button onClick={toggleSymptomSafe} className="flex items-center gap-3 text-surface hover:text-white transition-colors">
        <Shield size={20} />
        <span>{isSymptomSafe ? "Default Mode" : "Symptom-Safe"}</span>
      </button>
    </GlassPanel>
  );
}
