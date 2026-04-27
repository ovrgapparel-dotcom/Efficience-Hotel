import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [roomsData, setRoomsData] = useState([]);
  const [restaurantData, setRestaurantData] = useState([]);
  const [hrData, setHrData] = useState([]);
  const [financeData, setFinanceData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rooms = await AsyncStorage.getItem('@rooms');
        const resto = await AsyncStorage.getItem('@restaurant');
        const hr = await AsyncStorage.getItem('@hr');
        const finance = await AsyncStorage.getItem('@finance');

        if (rooms) setRoomsData(JSON.parse(rooms));
        if (resto) setRestaurantData(JSON.parse(resto));
        if (hr) setHrData(JSON.parse(hr));
        if (finance) setFinanceData(JSON.parse(finance));
      } catch (err) {
        console.error("Failed to load local data", err);
      }
    };
    loadData();
  }, []);

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

  const resetAllData = async () => {
    setRoomsData([]);
    setRestaurantData([]);
    setHrData([]);
    setFinanceData([]);
    await AsyncStorage.multiRemove(['@rooms', '@restaurant', '@hr', '@finance']);
  };

  return (
    <DataContext.Provider value={{
      roomsData, addRoomRow,
      restaurantData, addRestoRow,
      hrData, addHrRow,
      financeData, addFinanceRow,
      resetAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
