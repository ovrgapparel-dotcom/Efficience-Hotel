import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

// Hardcoded master key — immune to admin PIN updates
const MASTER_KEY = 'OV99';

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [pins, setPins] = useState({
    MANAGER: '1111',
    RECEPTION: '2222',
    BARMAN: '3333',
    CLEANER: '4444'
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('@userRole');
        if (savedRole) {
          setUserRole(savedRole);
        }
        const savedPins = await AsyncStorage.getItem('@pins');
        if (savedPins) {
          setPins(JSON.parse(savedPins));
        }
      } catch (e) {
        console.warn("Auth load error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const loginWithPin = async (inputPin) => {
    // Master key always grants MANAGER
    if (inputPin === MASTER_KEY) {
      setUserRole('MANAGER');
      await AsyncStorage.setItem('@userRole', 'MANAGER');
      return { success: true, role: 'MANAGER' };
    }
    const role = Object.keys(pins).find(key => pins[key] === inputPin);
    if (role) {
      setUserRole(role);
      await AsyncStorage.setItem('@userRole', role);
      return { success: true, role };
    }
    return { success: false };
  };

  // Verify a PIN for a specific pre-selected role
  const verifyRolePin = async (selectedRole, inputPin) => {
    // Master key always works
    if (inputPin === MASTER_KEY) {
      setUserRole(selectedRole);
      await AsyncStorage.setItem('@userRole', selectedRole);
      return { success: true };
    }
    if (pins[selectedRole] === inputPin) {
      setUserRole(selectedRole);
      await AsyncStorage.setItem('@userRole', selectedRole);
      return { success: true };
    }
    return { success: false };
  };

  const updatePin = async (role, newPin) => {
    const newPins = { ...pins, [role]: newPin };
    setPins(newPins);
    await AsyncStorage.setItem('@pins', JSON.stringify(newPins));
  };

  const login = async (role) => {
    setUserRole(role);
    await AsyncStorage.setItem('@userRole', role);
  };

  const logout = async () => {
    setUserRole(null);
    await AsyncStorage.removeItem('@userRole');
  };

  return (
    <AuthContext.Provider value={{ userRole, isLoading, login, loginWithPin, verifyRolePin, logout, pins, updatePin }}>
      {children}
    </AuthContext.Provider>
  );
};
