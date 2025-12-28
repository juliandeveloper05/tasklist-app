/**
 * ThemeContext - Dark/Light Mode Management
 * Task List App 2025
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@tasklist_theme';

// Light mode colors
export const lightColors = {
  // Backgrounds
  bgPrimary: '#F5F5F7',
  bgSecondary: '#FFFFFF',
  bgTertiary: '#E8E8ED',
  
  // Glassmorphism
  glassLight: 'rgba(0, 0, 0, 0.03)',
  glassMedium: 'rgba(0, 0, 0, 0.06)',
  glassStrong: 'rgba(0, 0, 0, 0.10)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  
  // Primary Gradient (Purple to Cyan)
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  
  // Accent Colors
  accentCyan: '#00B4D8',
  accentPurple: '#8B5CF6',
  accentPink: '#DB2777',
  accentBlue: '#2563EB',
  
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

// Dark mode colors (original)
export const darkColors = {
  // Backgrounds
  bgPrimary: '#0A0A0F',
  bgSecondary: '#12121A',
  bgTertiary: '#1A1A2E',
  
  // Glassmorphism
  glassLight: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Primary Gradient (Purple to Cyan)
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  
  // Accent Colors
  accentCyan: '#00D9FF',
  accentPurple: '#A855F7',
  accentPink: '#EC4899',
  accentBlue: '#3B82F6',
  
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
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference
  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
