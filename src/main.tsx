import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthCompanyProvider } from './context/AuthCompanyContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <AuthCompanyProvider>
      <App />
    </AuthCompanyProvider>
  </ThemeProvider>
);
