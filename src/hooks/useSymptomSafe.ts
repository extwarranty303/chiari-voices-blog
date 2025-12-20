import { useContext } from 'react';
import { SymptomSafeContext } from '../context/SymptomSafeContext';

export const useSymptomSafe = () => {
  const context = useContext(SymptomSafeContext);
  if (context === undefined) {
    throw new Error('useSymptomSafe must be used within a SymptomSafeProvider');
  }
  return context;
};
