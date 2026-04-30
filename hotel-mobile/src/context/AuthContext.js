import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // null means not logged in
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@userRole');
        if (savedRole) {
          setUserRole(savedRole);
        }
      } catch (e) {
        console.warn("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (role) => {
    setUserRole(role);
    await AsyncStorage.setItem('@userRole', role);
  };

  const logout = async () => {
    setUserRole(null);
    await AsyncStorage.removeItem('@userRole');
  };

  return (
    <AuthContext.Provider value={{ userRole, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
