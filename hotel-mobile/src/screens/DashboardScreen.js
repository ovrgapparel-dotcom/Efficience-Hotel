import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import KPI from "../components/KPI";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";

const BANNER_DASHBOARD = require("../../assets/banners/banner_dashboard.png");

export default function DashboardScreen({ navigation }) {
  const { roomsData, restaurantData, hrData, financeData, resetAllData } = useContext(DataContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
  const totalChambres = 40; 
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const Taux_Occ = ((chambresOccupees / totalChambres) * 100).toFixed(1);

  const CA_Restaurant = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);
  const Cout_Mat = restaurantData.reduce((acc, row) => acc + (row.coutMatiere || 0), 0);
  const Food_Cost = CA_Restaurant > 0 ? ((Cout_Mat / CA_Restaurant) * 100).toFixed(1) : 0;

  const CA_Total = CA_Hebergement + CA_Restaurant;

  const Couts_RH = hrData.reduce((acc, row) => acc + (row.salaire || 0), 0);
  const Autres_Revenus = financeData.filter(d => d.type === "Revenu").reduce((acc, row) => acc + (row.montant || 0), 0);
  const Autres_Couts = financeData.filter(d => d.type === "Coût").reduce((acc, row) => acc + (row.montant || 0), 0);

  const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts;
  const Marge = CA_Total > 0 ? ((EBITDA / CA_Total) * 100).toFixed(1) : 0;

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={styles.topBar}>
        <Text style={[styles.appName, { color: colors.text }]}>Efficience Hotel</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <FontAwesome5 name={isDark ? "sun" : "moon"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <DepartmentBanner
        image={BANNER_DASHBOARD}
        title="Résumé Consolidé"
        subtitle={today}
        icon={<FontAwesome5 name="hotel" size={26} color="#fff" />}
      />

      <View style={styles.kpiContainer}>
        <KPI title="CA Total" value={`${CA_Total.toLocaleString()} CFA`} isDark={isDark} />
        <KPI title="EBITDA" value={`${EBITDA.toLocaleString()} CFA`} isDark={isDark} />
        <KPI title="Marge OP" value={`${Marge} %`} isDark={isDark} />
        <KPI title="Taux d'Occup." value={`${Taux_Occ} %`} isDark={isDark} />
        <KPI title="Food Cost" value={`${Food_Cost} %`} isDark={isDark} />
        <KPI title="Coûts RH" value={`${Couts_RH.toLocaleString()} CFA`} isDark={isDark} />
      </View>

      <Text style={[styles.chartTitle, { color: colors.text }]}>Répartition du Chiffre d'Affaires</Text>
      <PieChart
        data={[
          { name: "Hébergement", population: CA_Hebergement, color: colors.primaryHover, legendFontColor: colors.textMuted, legendFontSize: 12 },
          { name: "Restauration", population: CA_Restaurant, color: colors.secondary, legendFontColor: colors.textMuted, legendFontSize: 12 },
          { name: "Autres", population: Autres_Revenus, color: "#f0a500", legendFontColor: colors.textMuted, legendFontSize: 12 }
        ]}
        width={Dimensions.get("window").width - 40}
        height={220}
        chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"0"}
        absolute
      />

      <View style={styles.actions}>
        <DynamicButton 
           title="Hébergement" 
           onPress={() => navigation.navigate("Hotel")} 
           icon={<FontAwesome5 name="bed" size={16} color="#fff" />} 
           width="48%" 
           color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
        />
        <DynamicButton 
           title="Restaurant" 
           onPress={() => navigation.navigate("Restaurant")} 
           icon={<MaterialIcons name="restaurant" size={16} color="#fff" />} 
           width="48%" 
           color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
        />
      </View>
      <View style={styles.actions}>
        <DynamicButton 
           title="Ressources" 
           onPress={() => navigation.navigate("HR")} 
           icon={<FontAwesome5 name="users" size={16} color="#fff" />} 
           width="48%" 
           color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
        />
        <DynamicButton 
           title="Finance" 
           onPress={() => navigation.navigate("Finance")} 
           icon={<FontAwesome5 name="chart-line" size={16} color="#fff" />} 
           width="48%" 
           color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <DynamicButton 
           title="Intelligence Exécutive (SAP)" 
           onPress={() => navigation.navigate("Insights")} 
           icon={<FontAwesome5 name="brain" size={18} color="#fff" />} 
           width="100%" 
           color={colors.secondary} hoverColor={colors.secondaryHover} isDark={isDark}
        />
      </View>

      <TouchableOpacity style={[styles.resetBtn, { borderColor: isDark ? "#ff6681" : "red" }]} onPress={() => resetAllData()}>
          <Text style={[styles.resetText, { color: isDark ? "#ff6681" : "red" }]}>Réinitialiser la Base de Données</Text>
      </TouchableOpacity>
      
      <View style={{height: 70}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  appName: { fontSize: 20, fontWeight: "bold" },
  themeToggle: { padding: 8 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, marginTop: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  resetBtn: { padding: 15, borderRadius: 8, marginTop: 30, borderWidth: 1, alignItems: "center" },
  resetText: { fontWeight: "bold" }
});
