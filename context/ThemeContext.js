/**
 * ThemeContext - Dark/Light Mode + Custom Color Themes
 * Task List App 2025
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@tasklist_theme';
const COLOR_THEME_STORAGE_KEY = '@tasklist_color_theme';

// Color Theme Palettes
export const colorThemes = {
  purple: {
    id: 'purple',
    name: 'Púrpura',
    emoji: '🟣',
    primary: '#A855F7',
    secondary: '#EC4899',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    accentCyan: '#00D9FF',
    accentPurple: '#A855F7',
    accentPink: '#EC4899',
    accentBlue: '#3B82F6',
  },
  ocean: {
    id: 'ocean',
    name: 'Océano',
    emoji: '🔵',
    primary: '#00D9FF',
    secondary: '#3B82F6',
    gradientStart: '#00D9FF',
    gradientEnd: '#3B82F6',
    accentCyan: '#00D9FF',
    accentPurple: '#6366F1',
    accentPink: '#06B6D4',
    accentBlue: '#3B82F6',
  },
  rose: {
    id: 'rose',
    name: 'Rosa',
    emoji: '🩷',
    primary: '#EC4899',
    secondary: '#F43F5E',
    gradientStart: '#EC4899',
    gradientEnd: '#F43F5E',
    accentCyan: '#FB7185',
    accentPurple: '#EC4899',
    accentPink: '#F43F5E',
    accentBlue: '#DB2777',
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda',
    emoji: '🟢',
    primary: '#10B981',
    secondary: '#14B8A6',
    gradientStart: '#10B981',
    gradientEnd: '#14B8A6',
    accentCyan: '#14B8A6',
    accentPurple: '#10B981',
    accentPink: '#059669',
    accentBlue: '#0D9488',
  },
  sunset: {
    id: 'sunset',
    name: 'Atardecer',
    emoji: '🟠',
    primary: '#F59E0B',
    secondary: '#EF4444',
    gradientStart: '#F59E0B',
    gradientEnd: '#EF4444',
    accentCyan: '#FBBF24',
    accentPurple: '#F59E0B',
    accentPink: '#EF4444',
    accentBlue: '#F97316',
  },
  ruby: {
    id: 'ruby',
    name: 'Rubí',
    emoji: '🔴',
    primary: '#EF4444',
    secondary: '#EC4899',
    gradientStart: '#EF4444',
    gradientEnd: '#EC4899',
    accentCyan: '#F87171',
    accentPurple: '#EF4444',
    accentPink: '#EC4899',
    accentBlue: '#DC2626',
  },
};

// Light mode base colors
const lightBase = {
  // Backgrounds
  bgPrimary: '#F5F5F7',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#E8E8ED',
  
  // Glassmorphism
  glassLight: 'rgba(0, 0, 0, 0.03)',
  glassMedium: 'rgba(0, 0, 0, 0.06)',
  glassStrong: 'rgba(0, 0, 0, 0.10)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  
  // Priority Colors
  priorityHigh: '#DC2626',
  priorityMedium: '#D97706',
  priorityLow: '#059669',
  
  // Category Colors
  categoryWork: '#2563EB',
  categoryPersonal: '#DB2777',
  categoryShopping: '#D97706',
  categoryHealth: '#059669',
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: 'rgba(26, 26, 46, 0.7)',
  textTertiary: 'rgba(26, 26, 46, 0.5)',
  textMuted: 'rgba(26, 26, 46, 0.3)',
  
  // Status
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  
  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.3)',
};

// Dark mode base colors
const darkBase = {
  // Backgrounds
  bgPrimary: '#0A0A0F',
  bgSecondary: '#12121A',
  bgTertiary: '#1A1A2E',
  
  // Glassmorphism
  glassLight: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Priority Colors
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',
  
  // Category Colors
  categoryWork: '#3B82F6',
  categoryPersonal: '#EC4899',
  categoryShopping: '#F59E0B',
  categoryHealth: '#10B981',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Legacy exports for backward compatibility
export const lightColors = { ...lightBase, ...colorThemes.purple };
export const darkColors = { ...darkBase, ...colorThemes.purple };

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedColorTheme, setSelectedColorTheme] = useState('purple');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedColorTheme] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(COLOR_THEME_STORAGE_KEY),
        ]);
        
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
        if (savedColorTheme !== null && colorThemes[savedColorTheme]) {
          setSelectedColorTheme(savedColorTheme);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Toggle dark/light mode
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Set color theme
  const setColorTheme = async (themeName) => {
    if (!colorThemes[themeName]) return;
    
    try {
      setSelectedColorTheme(themeName);
      await AsyncStorage.setItem(COLOR_THEME_STORAGE_KEY, themeName);
    } catch (error) {
      console.error('Error saving color theme:', error);
    }
  };

  // Merge base colors with selected color theme
  const baseColors = isDarkMode ? darkBase : lightBase;
  const themeColors = colorThemes[selectedColorTheme] || colorThemes.purple;
  
  const colors = {
    ...baseColors,
    gradientStart: themeColors.gradientStart,
    gradientEnd: themeColors.gradientEnd,
    accentCyan: themeColors.accentCyan,
    accentPurple: themeColors.accentPurple,
    accentPink: themeColors.accentPink,
    accentBlue: themeColors.accentBlue,
    primary: themeColors.primary,
    secondary: themeColors.secondary,
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        isLoading,
        selectedColorTheme,
        setColorTheme,
        colorThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

