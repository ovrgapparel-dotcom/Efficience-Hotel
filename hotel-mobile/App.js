import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text } from "react-native";
import { DataProvider } from "./src/context/DataContext";

import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import HotelScreen from "./src/screens/HotelScreen";
import RestaurantScreen from "./src/screens/RestaurantScreen";
import HrScreen from "./src/screens/HrScreen";
import FinanceScreen from "./src/screens/FinanceScreen";
import InsightsScreen from "./src/screens/InsightsScreen";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainLayout() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Résumé Journalier Global" }} />
      <MainStack.Screen name="Insights" component={InsightsScreen} options={{ title: "Projections & IA" }} />
      <MainStack.Screen name="Hotel" component={HotelScreen} options={{ title: "Hébergement" }} />
      <MainStack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: "Restaurant" }} />
      <MainStack.Screen name="HR" component={HrScreen} options={{ title: "Ressources Humaines" }} />
      <MainStack.Screen name="Finance" component={FinanceScreen} options={{ title: "Finance" }} />
    </MainStack.Navigator>
  );
}

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainLayout} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
