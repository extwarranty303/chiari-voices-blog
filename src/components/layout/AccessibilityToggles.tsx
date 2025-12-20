import { useSymptomSafe } from '../../hooks/useSymptomSafe';
import { useFont } from '../../hooks/useFont';

export default function AccessibilityToggles() {
  const { isSymptomSafe, toggleSymptomSafe } = useSymptomSafe();
  const { isDyslexicFont, toggleDyslexicFont } = useFont();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <label htmlFor="symptom-safe-toggle" className="text-sm text-surface mr-2">Symptom Safe Mode</label>
        <button 
          id="symptom-safe-toggle"
          onClick={toggleSymptomSafe} 
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out ${isSymptomSafe ? 'bg-accent' : 'bg-gray-600'}`}>
          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isSymptomSafe ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      <div className="flex items-center">
        <label htmlFor="dyslexic-font-toggle" className="text-sm text-surface mr-2">Dyslexic Font</label>
        <button 
          id="dyslexic-font-toggle"
          onClick={toggleDyslexicFont} 
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out ${isDyslexicFont ? 'bg-accent' : 'bg-gray-600'}`}>
          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isDyslexicFont ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}
