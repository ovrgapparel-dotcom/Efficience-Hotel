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
  const [consumablesData, setConsumablesData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [housekeepingData, setHousekeepingData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rooms = await storage.getItem('@rooms');
        const resto = await storage.getItem('@restaurant');
        const hr = await storage.getItem('@hr');
        const finance = await storage.getItem('@finance');
        const inventory = await storage.getItem('@inventory');
        const consumables = await storage.getItem('@consumables');
        const clients = await storage.getItem('@clients');
        const housekeeping = await storage.getItem('@housekeeping');
        const posSales = await storage.getItem('@posSales');

        if (rooms) setRoomsData(JSON.parse(rooms));
        if (resto) setRestaurantData(JSON.parse(resto));
        if (hr) setHrData(JSON.parse(hr));
        if (finance) setFinanceData(JSON.parse(finance));
        if (inventory) setInventoryData(JSON.parse(inventory));

        // Use custom initial array if absolutely empty
        const defaultConsumables = [
          { id: 'b1', date: new Date().toLocaleDateString('fr-FR'), nom: 'Bière', categorie: 'Bar', qte: 200, sold: 0 },
          { id: 'v1', date: new Date().toLocaleDateString('fr-FR'), nom: 'Vin', categorie: 'Bar', qte: 50, sold: 0 },
          { id: 'bt1', date: new Date().toLocaleDateString('fr-FR'), nom: 'Bouteille VIP', categorie: 'Bar', qte: 30, sold: 0 },
          { id: 'c1', date: new Date().toLocaleDateString('fr-FR'), nom: 'Cocktails', categorie: 'Bar', qte: 150, sold: 0 },
          { id: 'r1', date: new Date().toLocaleDateString('fr-FR'), nom: 'Repas Cuisine', categorie: 'Alimentaire', qte: 100, sold: 0 }
        ];

        if (consumables) {
          const parsed = JSON.parse(consumables);
          // Merge missing defaults
          const merged = [...parsed];
          defaultConsumables.forEach(def => {
            if (!merged.find(m => m.nom === def.nom)) {
              merged.push(def);
            }
          });
          setConsumablesData(merged);
        } else {
          setConsumablesData(defaultConsumables);
          await storage.setItem('@consumables', JSON.stringify(defaultConsumables));
        }

        if (clients) setClientsData(JSON.parse(clients));
        if (housekeeping) setHousekeepingData(JSON.parse(housekeeping));
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

  const addConsumableRow = async (row) => {
    // If it exists, accumulate it securely, otherwise add new
    const existingIndex = consumablesData.findIndex(c => c.nom.toLowerCase() === row.nom.toLowerCase());
    let newData = [...consumablesData];
    if (existingIndex >= 0) {
      newData[existingIndex].qte += row.qte;
    } else {
      newData = [row, ...consumablesData];
    }
    setConsumablesData(newData);
    await storage.setItem('@consumables', JSON.stringify(newData));
  };

  // Add POS sale method to deduct sold numbers in consumables
  const addPOSSale = async (productName, quantity) => {
    let newData = [...consumablesData];
    const index = newData.findIndex(c => c.nom.toLowerCase() === productName.toLowerCase());
    if (index >= 0) {
      // we store 'sold' inline or we just calculate it! 
      // let's just track it natively inside consumablesData as 'sold'
      newData[index].sold = (newData[index].sold || 0) + quantity;
      setConsumablesData(newData);
      await storage.setItem('@consumables', JSON.stringify(newData));
    }
  };

  // Operational Deductions (Generic fallbacks if needed)
  const hotelUsage = roomsData.length; 

  const totalNettoyageStock = consumablesData.filter(c => c.categorie === 'Nettoyage').reduce((acc, c) => acc + c.qte, 0);
  const remainingNettoyage = totalNettoyageStock - hotelUsage;

  const addClientRow = async (row) => {
    const newData = [row, ...clientsData];
    setClientsData(newData);
    await storage.setItem('@clients', JSON.stringify(newData));
  };

  const addHousekeepingTask = async (task) => {
    const newData = [task, ...housekeepingData];
    setHousekeepingData(newData);
    await storage.setItem('@housekeeping', JSON.stringify(newData));
  };

  const validateHousekeepingTask = async (id) => {
    const newData = housekeepingData.map(t => t.id === id ? { ...t, completed: true } : t);
    setHousekeepingData(newData);
    await storage.setItem('@housekeeping', JSON.stringify(newData));
  };

  const resetAllData = async () => {
    setRoomsData([]);
    setRestaurantData([]);
    setHrData([]);
    setFinanceData([]);
    setInventoryData([]);
    setConsumablesData([]);
    await storage.removeItems(['@rooms', '@restaurant', '@hr', '@finance', '@inventory', '@consumables']);
  };

  return (
    <DataContext.Provider value={{
      roomsData, addRoomRow,
      restaurantData, addRestoRow,
      hrData, addHrRow,
      financeData, addFinanceRow,
      inventoryData, addInventoryRow,
      consumablesData, addConsumableRow, addPOSSale,
      clientsData, addClientRow,
      housekeepingData, addHousekeepingTask, validateHousekeepingTask,
      remainingNettoyage,
      monthlyInventoryCost,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
