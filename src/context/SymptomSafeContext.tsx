import React, { createContext, useState, useMemo, useEffect } from 'react';

interface SymptomSafeContextType {
  isSymptomSafe: boolean;
  toggleSymptomSafe: () => void;
}

export const SymptomSafeContext = createContext<SymptomSafeContextType | undefined>(undefined);

export const SymptomSafeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isSymptomSafe, setIsSymptomSafe] = useState(false);

  useEffect(() => {
    if (isSymptomSafe) {
      document.body.classList.add('symptom-safe');
    } else {
      document.body.classList.remove('symptom-safe');
    }
  }, [isSymptomSafe]);

  const toggleSymptomSafe = () => {
    setIsSymptomSafe(prev => !prev);
  };

  const value = useMemo(() => ({ isSymptomSafe, toggleSymptomSafe }), [isSymptomSafe]);

  return (
    <SymptomSafeContext.Provider value={value}>
      {children}
    </SymptomSafeContext.Provider>
  );
};
