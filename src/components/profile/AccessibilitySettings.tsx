
import React from 'react';
import { useSymptomSafe } from '../../hooks/useSymptomSafe';
import { useFont } from '../../hooks/useFont';

export const AccessibilitySettings: React.FC = () => {
  const { isSymptomSafe, toggleSymptomSafe } = useSymptomSafe();
  const { isDyslexicFont, toggleDyslexicFont } = useFont();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Accessibility Settings</h2>
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <div>
            <h3 className="font-medium text-white">Symptom-Safe Mode</h3>
            <p className="text-sm text-gray-400">Hides potentially triggering images and content.</p>
        </div>
        <button
          onClick={toggleSymptomSafe}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            isSymptomSafe ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              isSymptomSafe ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <div>
            <h3 className="font-medium text-white">Dyslexia-Friendly Font</h3>
            <p className="text-sm text-gray-400">Uses a font designed to be easier to read for people with dyslexia.</p>
        </div>
        <button
          onClick={toggleDyslexicFont}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            isDyslexicFont ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              isDyslexicFont ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
