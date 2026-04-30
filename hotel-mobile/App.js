import React, { useContext, useEffect } from "react";
import { NotificationService } from "./src/services/NotificationService";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DataProvider } from "./src/context/DataContext";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

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
const Tab = createBottomTabNavigator();

function AppLogout() {
  const { logout } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 15, padding: 5, flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="log-out-outline" size={22} color={colors.primary} />
      <Text style={{ color: colors.primary, fontWeight: 'bold', marginLeft: 4, fontSize: 12 }}>Sortir</Text>
    </TouchableOpacity>
  );
}

function AppThemeToggle() {
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);
  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 15, padding: 5 }}>
      <FontAwesome5 name={isDark ? "sun" : "moon"} size={18} color={colors.text} />
    </TouchableOpacity>
  );
}

function MainLayout() {
  const { userRole } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const isManager = userRole === 'MANAGER';
  const isReception = userRole === 'RECEPTION';
  const isBarman = userRole === 'BARMAN';
  const isCleaner = userRole === 'CLEANER';

  return (
    <Tab.Navigator screenOptions={{ 
      headerRight: () => <AppLogout />,
      headerLeft: () => <AppThemeToggle />,
      headerStyle: { backgroundColor: colors.card },
      headerTintColor: colors.text,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 16, fontWeight: 'bold' }
    }}>
      {/* Admin / Dashboard */}
      {(isManager || isReception) && (
        <Tab.Screen 
          name="Admin" 
          component={DashboardScreen} 
          options={{ 
            title: "Administration Centrale",
            tabBarLabel: "Admin",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="shield-alt" size={size} color={color} />
          }} 
        />
      )}

      {/* Hotel Operations (Manager / Reception) */}
      {(isManager || isReception) && (
        <Tab.Screen 
          name="Hotel" 
          component={HotelScreen} 
          options={{ 
            title: "Service Réception",
            tabBarLabel: "Réception",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="concierge-bell" size={size} color={color} />
          }} 
        />
      )}

      {/* Housekeeping (Cleaner / Reception / Manager) */}
      {(isManager || isCleaner || isReception) && (
        <Tab.Screen 
          name="Entretien" 
          component={EntretienScreen} 
          options={{ 
            title: "Service Entretien",
            tabBarLabel: "Entretien",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="broom" size={size} color={color} />
          }} 
        />
      )}

      {/* Point of Sale (Manager / Barman) */}
      {(isManager || isBarman) && (
        <Tab.Screen 
          name="Restaurant" 
          component={RestaurantScreen} 
          options={{ 
            title: "Service Bar",
            tabBarLabel: "Bar",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="cocktail" size={size} color={color} />
          }} 
        />
      )}

      {/* Stock Management (Manager / Barman) */}
      {(isManager || isBarman) && (
        <Tab.Screen 
          name="Inventory" 
          component={InventoryScreen} 
          options={{ 
            title: "Stock",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="boxes" size={size} color={color} />
          }} 
        />
      )}

      {/* Manager Specifics */}
      {isManager && (
        <Tab.Screen 
          name="HR" 
          component={HrScreen} 
          options={{ 
            title: "RH",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="users-cog" size={size} color={color} />
          }} 
        />
      )}

      {isManager && (
        <Tab.Screen 
          name="Finance" 
          component={FinanceScreen} 
          options={{ 
            title: "Finance",
            tabBarIcon: ({ color, size }) => <FontAwesome5 name="file-invoice-dollar" size={size} color={color} />
          }} 
        />
      )}

      {/* Secondary Screens for Manager usually accessible via Dashboard navigation but can be screens here */}
      {isManager && <Tab.Screen name="CRM" component={CRMScreen} options={{ title: "CRM", tabBarButton: () => null }} />}
      {isManager && <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: "IA", tabBarButton: () => null }} />}
      {isManager && <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: "PDF", tabBarButton: () => null }} />}
      
    </Tab.Navigator>
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
