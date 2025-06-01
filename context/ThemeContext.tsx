import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
}

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activeTheme: string;
  setActiveTheme: (themeId: string) => void;
}

const themePresets = {
  default: {
    primary: '#ff6456',
    secondary: '#00BCD4',
    accent: '#FFD700',
  },
  ocean: {
    primary: '#2196F3',
    secondary: '#4CAF50',
    accent: '#FFC107',
  },
  sunset: {
    primary: '#FF9800',
    secondary: '#E91E63',
    accent: '#9C27B0',
  },
  forest: {
    primary: '#4CAF50',
    secondary: '#8BC34A',
    accent: '#CDDC39',
  },
};

const baseColors = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const lightColors: Omit<ThemeColors, 'primary' | 'secondary' | 'accent'> = {
  ...baseColors,
  background: '#F9F9F9',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

const darkColors: Omit<ThemeColors, 'primary' | 'secondary' | 'accent'> = {
  ...baseColors,
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
};

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: { ...themePresets.default, ...lightColors },
  toggleTheme: () => {},
  themeMode: 'system',
  setThemeMode: () => {},
  activeTheme: 'default',
  setActiveTheme: () => {},
});

interface AppThemeProviderProps {
  children: ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [activeTheme, setActiveTheme] = useState('default');
  
  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => {
      if (prev === 'system') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [systemColorScheme]);

  const themeColors = {
    ...themePresets[activeTheme as keyof typeof themePresets],
    ...(isDark ? darkColors : lightColors),
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors: themeColors,
      toggleTheme,
      themeMode,
      setThemeMode,
      activeTheme,
      setActiveTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}