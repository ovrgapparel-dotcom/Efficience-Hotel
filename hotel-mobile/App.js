import React, { useContext, useEffect } from "react";
import { NotificationService } from "./src/services/NotificationService";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DataProvider } from "./src/context/DataContext";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import HotelScreen from "./src/screens/HotelScreen";
import RestaurantScreen from "./src/screens/RestaurantScreen";
import HrScreen from "./src/screens/HrScreen";
import FinanceScreen from "./src/screens/FinanceScreen";
import InsightsScreen from "./src/screens/InsightsScreen";
import InventoryScreen from "./src/screens/InventoryScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import CRMScreen from "./src/screens/CRMScreen";
import EntretienScreen from "./src/screens/EntretienScreen";

const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainLayout() {
  const { userRole } = useContext(AuthContext);

  const isManager = userRole === 'MANAGER';
  const isReception = userRole === 'RECEPTION';
  const isBarman = userRole === 'BARMAN';
  const isCleaner = userRole === 'CLEANER';

  return (
    <MainStack.Navigator>
      {/* Priority 1 routes (Manager / Dashboard usually first) */}
      {(isManager || isReception) && <MainStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Résumé Journalier Global", headerShown: false }} />}
      
      {/* Operations (Hotel & HR) */}
      {(isManager || isReception) && <MainStack.Screen name="Hotel" component={HotelScreen} options={{ title: "Hébergement" }} />}
      {(isManager || isReception) && <MainStack.Screen name="HR" component={HrScreen} options={{ title: "Ressources Humaines" }} />}
      {(isManager || isReception) && <MainStack.Screen name="CRM" component={CRMScreen} options={{ title: "Base Clients" }} />}

      {/* Housekeeping Engine */}
      {(isManager || isCleaner || isReception) && <MainStack.Screen name="Entretien" component={EntretienScreen} options={{ title: "Housekeeping" }} />}

      {/* Bar / Restaurant Operations */}
      {(isManager || isBarman) && <MainStack.Screen name="Restaurant" component={RestaurantScreen} options={{ title: "Restaurant & POS" }} />}
      {(isManager || isBarman) && <MainStack.Screen name="Inventory" component={InventoryScreen} options={{ title: "Gestion des Stocks" }} />}
      
      {/* Finance & Insights (Manager Only) */}
      {isManager && <MainStack.Screen name="Finance" component={FinanceScreen} options={{ title: "Finance" }} />}
      {isManager && <MainStack.Screen name="Insights" component={InsightsScreen} options={{ title: "Projections & IA" }} />}
      {isManager && <MainStack.Screen name="Reports" component={ReportsScreen} options={{ title: "Rapports & Exports" }} />}
    </MainStack.Navigator>
  );
}

function RootNavigator() {
  const { isDark } = useContext(ThemeContext);
  const { userRole, isLoading } = useContext(AuthContext);

  if (isLoading) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainLayout} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    NotificationService.setup();
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <RootNavigator />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
