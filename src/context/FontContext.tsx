import React, { createContext, useState, useMemo } from 'react';

interface FontContextType {
  isDyslexicFont: boolean;
  toggleDyslexicFont: () => void;
}

export const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);

  const toggleDyslexicFont = () => {
    setIsDyslexicFont(prev => !prev);
  };

  const value = useMemo(() => ({ isDyslexicFont, toggleDyslexicFont }), [isDyslexicFont]);

  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  );
};
