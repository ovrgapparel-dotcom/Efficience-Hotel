import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [roomsData, setRoomsData] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [hrData, setHrData] = useState([]);
  const [financeData, setFinanceData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]); // [NEW]

  useEffect(() => {
    const loadData = async () => {
      try {
        const rooms = await AsyncStorage.getItem('@rooms');
        const resto = await AsyncStorage.getItem('@restaurant');
        const hr = await AsyncStorage.getItem('@hr');
        const finance = await AsyncStorage.getItem('@finance');
        const inventory = await AsyncStorage.getItem('@inventory'); // [NEW]

        if (rooms) setRoomsData(JSON.parse(rooms));
        if (resto) setRestaurantData(JSON.parse(resto));
        if (hr) setHrData(JSON.parse(hr));
        if (finance) setFinanceData(JSON.parse(finance));
        if (inventory) setInventoryData(JSON.parse(inventory)); // [NEW]
      } catch (err) {
        console.error("Failed to load local data", err);
      }
    };
    loadData();
  }, []);

  // [NEW] Logic for stock amortisation
  const monthlyInventoryCost = inventoryData.reduce((acc, item) => {
    // Mobilier: 5 ans (60m), Équipement: 3 ans (36m), Linge/Fournitures: 1 an (12m)
    let months = 12;
    if (item.categorie === "Mobilier") months = 60;
    else if (item.categorie === "Équipement") months = 36;
    
    const monthlyAmort = (item.valeurInitiale || 0) / months;
    return acc + monthlyAmort;
  }, 0);

  const addRoomRow = async (row) => {
    const newData = [row, ...roomsData];
    setRoomsData(newData);
    await AsyncStorage.setItem('@rooms', JSON.stringify(newData));
  };
  
  const addRestoRow = async (row) => {
    const newData = [row, ...restaurantData];
    setRestaurantData(newData);
    await AsyncStorage.setItem('@restaurant', JSON.stringify(newData));
  };

  const addHrRow = async (row) => {
    const newData = [row, ...hrData];
    setHrData(newData);
    await AsyncStorage.setItem('@hr', JSON.stringify(newData));
  };

  const addFinanceRow = async (row) => {
    const newData = [row, ...financeData];
    setFinanceData(newData);
    await AsyncStorage.setItem('@finance', JSON.stringify(newData));
  };

  const addInventoryRow = async (row) => {
    const newData = [row, ...inventoryData];
    setInventoryData(newData);
    await AsyncStorage.setItem('@inventory', JSON.stringify(newData));
  };

  const resetAllData = async () => {
    setRoomsData([]);
    setRestaurantData([]);
    setHrData([]);
    setFinanceData([]);
    setInventoryData([]);
    await AsyncStorage.multiRemove(['@rooms', '@restaurant', '@hr', '@finance', '@inventory']);
  };

  return (
    <DataContext.Provider value={{
      roomsData, addRoomRow,
      restaurantData, addRestoRow,
      hrData, addHrRow,
      financeData, addFinanceRow,
      inventoryData, addInventoryRow, // [NEW]
      monthlyInventoryCost, // [NEW]
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
