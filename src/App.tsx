
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SymptomSafeProvider } from './context/SymptomSafeContext';
import { FontProvider } from './context/FontContext';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <AuthProvider>
      <SymptomSafeProvider>
        <FontProvider>
          <Router>
            <MainLayout />
          </Router>
        </FontProvider>
      </SymptomSafeProvider>
    </AuthProvider>
  );
}

export default App;
