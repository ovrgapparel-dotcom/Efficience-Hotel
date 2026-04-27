import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem('@theme_dark');
      if (stored === 'true') setIsDark(true);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const val = !isDark;
    setIsDark(val);
    await AsyncStorage.setItem('@theme_dark', val.toString());
  };

  // ── Ivoire / Abidjan Palette ──────────────────────────────────────────
  // Light: warm cream canvas inspired by savane & sable d'Abidjan
  // Dark:  deep ebony & earth inspired by la nuit sur la Lagune Ébrié
  // Accent palette drawn from Ivory Coast flag (orange, white, vert) + kente gold
  const colors = {
    // Backgrounds
    background:  isDark ? '#12100E' : '#FFF8F0',
    card:        isDark ? '#1E1A16' : '#FFFFFF',

    // Text
    text:        isDark ? '#F5E6D3' : '#2C1A0E',
    textMuted:   isDark ? '#A08060' : '#7A5C3A',

    // Borders
    border:      isDark ? '#3A2A1A' : '#EAD9C5',

    // Input
    inputBg:     isDark ? '#2C2018' : '#FFFFFF',
    inputText:   isDark ? '#F5E6D3' : '#2C1A0E',

    // Brand colours — Ivoire Orange + Vert CI + Kente Gold
    primary:       '#C25A00',   // Ivoire deep orange
    primaryHover:  '#E07010',   // Lighter burnt orange on hover
    secondary:     '#006B3F',   // Ivory Coast flag green
    secondaryHover:'#00954F',   // Brighter green hover

    // KPI accent gold
    gold: '#F0A500',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
