import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

export const DataContext = createContext();

// Web-safe storage shim: uses localStorage on web, AsyncStorage on native
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.setItem(key, value);
  },
  removeItems: async (keys) => {
    if (Platform.OS === 'web') {
      try { keys.forEach(k => localStorage.removeItem(k)); } catch {}
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.multiRemove(keys);
  },
};

export const DataProvider = ({ children }) => {
  const [roomsData, setRoomsData] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [hrData, setHrData] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rooms = await storage.getItem('@rooms');
        const resto = await storage.getItem('@restaurant');
        const hr = await storage.getItem('@hr');
        const finance = await storage.getItem('@finance');
        const inventory = await storage.getItem('@inventory');

        if (rooms) setRoomsData(JSON.parse(rooms));
        if (resto) setRestaurantData(JSON.parse(resto));
        if (hr) setHrData(JSON.parse(hr));
        if (finance) setFinanceData(JSON.parse(finance));
        if (inventory) setInventoryData(JSON.parse(inventory));
      } catch (err) {
        console.warn("Failed to load local data", err);
      }
    };
    loadData();
  }, []);

  // Stock amortisation: Mobilier=5yr, Équipement=3yr, Fournitures=1yr
  const monthlyInventoryCost = inventoryData.reduce((acc, item) => {
    let months = 12;
    if (item.categorie === "Mobilier") months = 60;
    else if (item.categorie === "Équipement") months = 36;
    return acc + (item.valeurInitiale || 0) / months;
  }, 0);

  const addRoomRow = async (row) => {
    const newData = [row, ...roomsData];
    setRoomsData(newData);
    await storage.setItem('@rooms', JSON.stringify(newData));
  };

  const addRestoRow = async (row) => {
    const newData = [row, ...restaurantData];
    setRestaurantData(newData);
    await storage.setItem('@restaurant', JSON.stringify(newData));
  };

  const addHrRow = async (row) => {
    const newData = [row, ...hrData];
    setHrData(newData);
    await storage.setItem('@hr', JSON.stringify(newData));
  };

  const addFinanceRow = async (row) => {
    const newData = [row, ...financeData];
    setFinanceData(newData);
    await storage.setItem('@finance', JSON.stringify(newData));
  };

  const addInventoryRow = async (row) => {
    const newData = [row, ...inventoryData];
    setInventoryData(newData);
    await storage.setItem('@inventory', JSON.stringify(newData));
  };

  const resetAllData = async () => {
    setRoomsData([]);
    setRestaurantData([]);
    setHrData([]);
    setFinanceData([]);
    setInventoryData([]);
    await storage.removeItems(['@rooms', '@restaurant', '@hr', '@finance', '@inventory']);
  };

  return (
    <DataContext.Provider value={{
      roomsData, addRoomRow,
      restaurantData, addRestoRow,
      hrData, addHrRow,
      financeData, addFinanceRow,
      inventoryData, addInventoryRow,
      monthlyInventoryCost,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
