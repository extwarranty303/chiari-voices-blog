
import { useEffect } from 'react';
import { Header } from '../components/layout';
import { FloatingAccessibilityMenu } from '../components/layout/FloatingAccessibilityMenu';
import AppRoutes from '../routing/AppRoutes';
import { useFont } from '../hooks/useFont';

const MainLayout = () => {
  const { isDyslexicFont } = useFont();

  useEffect(() => {
    if (isDyslexicFont) {
      document.body.classList.add('font-opendyslexic');
    } else {
      document.body.classList.remove('font-opendyslexic');
    }
  }, [isDyslexicFont]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-surface font-sans selection:bg-accent selection:text-white">
      <Header />
      <FloatingAccessibilityMenu />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
      
      <footer className="w-full py-8 mt-auto glass-panel">
        <div className="container mx-auto px-4 text-center text-surface/60 text-xs">
          <p className="mb-4">
            Disclaimer: The Chiari Voices Foundation does not provide medical advice. The information on this website is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
          <p>
            © 2025 The Chiari Voices Foundation. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
