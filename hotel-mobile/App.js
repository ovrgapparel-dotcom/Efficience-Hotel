import React, { useContext } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DataProvider } from "./src/context/DataContext";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";

import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import HotelScreen from "./src/screens/HotelScreen";
import RestaurantScreen from "./src/screens/RestaurantScreen";
import HrScreen from "./src/screens/HrScreen";
import FinanceScreen from "./src/screens/FinanceScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import InventoryScreen from "./src/screens/InventoryScreen";
import ReportsScreen from "./src/screens/ReportsScreen";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainLayout() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Résumé Journalier Global", headerShown: false }} />
      <MainStack.Screen name="Inventory" component={InventoryScreen} options={{ title: "Gestion des Stocks" }} />
      <MainStack.Screen name="Insights" component={InsightsScreen} options={{ title: "Projections & IA" }} />
      <MainStack.Screen name="Hotel" component={HotelScreen} options={{ title: "Hébergement" }} />
      <MainStack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: "Restaurant" }} />
      <MainStack.Screen name="HR" component={HrScreen} options={{ title: "Ressources Humaines" }} />
      <MainStack.Screen name="Finance" component={FinanceScreen} options={{ title: "Finance" }} />
      <MainStack.Screen name="Reports" component={ReportsScreen} options={{ title: "Rapports & Exports" }} />
    </MainStack.Navigator>
  );
}

function RootNavigator() {
  const { isDark } = useContext(ThemeContext);
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainLayout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <RootNavigator />
      </DataProvider>
    </ThemeProvider>
  );
}
