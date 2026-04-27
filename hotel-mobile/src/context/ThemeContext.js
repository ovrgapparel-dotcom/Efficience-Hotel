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

  const colors = {
    background: isDark ? '#121212' : '#f7f9fc',
    card: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#efefef' : '#1a1a2e',
    textMuted: isDark ? '#aaa' : '#666',
    border: isDark ? '#333' : '#eee',
    primary: '#0f3460',
    primaryHover: '#1f64b0',
    secondary: '#e94560',
    secondaryHover: '#ff6681',
    inputBg: isDark ? '#2c2c2c' : '#fff',
    inputText: isDark ? '#fff' : '#000',
    chartLine: isDark ? '#ffffff' : '#0f3460',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
