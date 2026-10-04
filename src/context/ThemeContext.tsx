import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColorOption {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  accentClass: string;
  borderClass: string;
  bgLightClass: string;
}

export const BRAND_THEME_COLORS: ThemeColorOption[] = [
  { id: 'cyan', name: 'Cyan Electric (Default)', hex: '#06b6d4', rgb: '6, 182, 212', accentClass: 'text-cyan-400', borderClass: 'border-cyan-500', bgLightClass: 'bg-cyan-500/10' },
  { id: 'emerald', name: 'Emerald Velvet', hex: '#10b981', rgb: '16, 185, 129', accentClass: 'text-emerald-400', borderClass: 'border-emerald-500', bgLightClass: 'bg-emerald-500/10' },
  { id: 'violet', name: 'Royal Violet', hex: '#8b5cf6', rgb: '139, 92, 246', accentClass: 'text-violet-400', borderClass: 'border-violet-500', bgLightClass: 'bg-violet-500/10' },
  { id: 'indigo', name: 'Electric Indigo', hex: '#6366f1', rgb: '99, 102, 241', accentClass: 'text-indigo-400', borderClass: 'border-indigo-500', bgLightClass: 'bg-indigo-500/10' },
  { id: 'amber', name: 'Sunset Amber', hex: '#f59e0b', rgb: '245, 158, 11', accentClass: 'text-amber-400', borderClass: 'border-amber-500', bgLightClass: 'bg-amber-500/10' },
  { id: 'rose', name: 'Rose Crimson', hex: '#f43f5e', rgb: '244, 63, 94', accentClass: 'text-rose-400', borderClass: 'border-rose-500', bgLightClass: 'bg-rose-500/10' },
  { id: 'sky', name: 'Sky Blue', hex: '#0ea5e9', rgb: '14, 165, 233', accentClass: 'text-sky-400', borderClass: 'border-sky-500', bgLightClass: 'bg-sky-500/10' },
  { id: 'lime', name: 'Neon Lime', hex: '#84cc16', rgb: '132, 204, 22', accentClass: 'text-lime-400', borderClass: 'border-lime-500', bgLightClass: 'bg-lime-500/10' },
  { id: 'fuchsia', name: 'Fuchsia Magenta', hex: '#d946ef', rgb: '217, 70, 239', accentClass: 'text-fuchsia-400', borderClass: 'border-fuchsia-500', bgLightClass: 'bg-fuchsia-500/10' },
  { id: 'teal', name: 'Obsidian Teal', hex: '#14b8a6', rgb: '20, 184, 166', accentClass: 'text-teal-400', borderClass: 'border-teal-500', bgLightClass: 'bg-teal-500/10' },
];

interface ThemeContextType {
  mode: 'dark' | 'light';
  toggleMode: () => void;
  activeColor: ThemeColorOption;
  setColor: (colorId: string) => void;
  allColors: ThemeColorOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [activeColor, setActiveColor] = useState<ThemeColorOption>(BRAND_THEME_COLORS[0]);

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('datanexus_theme_mode') as 'dark' | 'light' | null;
      if (savedMode === 'light' || savedMode === 'dark') {
        setMode(savedMode);
      }

      const savedColorId = localStorage.getItem('datanexus_theme_color');
      if (savedColorId) {
        const found = BRAND_THEME_COLORS.find(c => c.id === savedColorId);
        if (found) setActiveColor(found);
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply CSS variables and classes whenever mode or color changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply color variables
    root.style.setProperty('--theme-primary', activeColor.hex);
    root.style.setProperty('--theme-primary-rgb', activeColor.rgb);
    root.style.setProperty('--theme-glow', `rgba(${activeColor.rgb}, 0.28)`);
    root.style.setProperty('--theme-card-border', `rgba(${activeColor.rgb}, 0.28)`);
    root.style.setProperty('--theme-card-border-hover', `rgba(${activeColor.rgb}, 0.6)`);
    root.style.setProperty('--theme-card-glow', `rgba(${activeColor.rgb}, 0.18)`);
    root.setAttribute('data-theme-color', activeColor.id);
    body.setAttribute('data-theme-color', activeColor.id);

    if (mode === 'light') {
      body.classList.add('light-mode');
      root.classList.add('light');
      root.style.setProperty('--bg-page', '#f8fafc');
      root.style.setProperty('--text-page', '#0f172a');
      root.style.setProperty('--theme-card-bg', 'rgba(255, 255, 255, 0.92)');
    } else {
      body.classList.remove('light-mode');
      root.classList.remove('light');
      root.style.setProperty('--bg-page', '#090d16');
      root.style.setProperty('--text-page', '#f8fafc');
      root.style.setProperty('--theme-card-bg', 'rgba(15, 23, 42, 0.85)');
    }

    try {
      localStorage.setItem('datanexus_theme_mode', mode);
      localStorage.setItem('datanexus_theme_color', activeColor.id);
    } catch {
      // ignore
    }
  }, [mode, activeColor]);

  const toggleMode = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setColor = (colorId: string) => {
    const found = BRAND_THEME_COLORS.find(c => c.id === colorId);
    if (found) {
      setActiveColor(found);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        activeColor,
        setColor,
        allColors: BRAND_THEME_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
