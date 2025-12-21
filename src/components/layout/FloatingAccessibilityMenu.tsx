
import { Settings, X } from 'lucide-react';
import { GlassPanel } from '../ui';
import { useState } from 'react';
import AccessibilityToggles from './AccessibilityToggles';

export function FloatingAccessibilityMenu() {
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
      <AccessibilityToggles />
    </GlassPanel>
  );
}
