import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import HotelScreen from "./src/screens/HotelScreen";
import RestaurantScreen from "./src/screens/RestaurantScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainLayout() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("History")}>
              <Text style={{ color: "#0f3460", fontWeight: "bold", marginRight: 15 }}>Historique</Text>
            </TouchableOpacity>
          )
        })}
      />
      <MainStack.Screen name="Hotel" component={HotelScreen} options={{ title: "Sim Hôtel" }} />
      <MainStack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: "Sim Resto" }} />
      <MainStack.Screen name="History" component={HistoryScreen} options={{ title: "Historique" }} />
    </MainStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainLayout} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
