import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import KPI from "../components/KPI";

export default function DashboardScreen({ navigation }) {
  const { roomsData, restaurantData, hrData, financeData, resetAllData } = useContext(DataContext);

  // Hébergement Metrics
  const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
  const totalChambres = 40; 
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const Taux_Occ = ((chambresOccupees / totalChambres) * 100).toFixed(1);

  // Restaurant Metrics
  const CA_Restaurant = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);
  const Cout_Mat = restaurantData.reduce((acc, row) => acc + (row.coutMatiere || 0), 0);
  const Food_Cost = CA_Restaurant > 0 ? ((Cout_Mat / CA_Restaurant) * 100).toFixed(1) : 0;

  // Global CA
  const CA_Total = CA_Hebergement + CA_Restaurant;

  // HR & Finance Metrics
  const Couts_RH = hrData.reduce((acc, row) => acc + (row.salaire || 0), 0);
  const Autres_Revenus = financeData.filter(d => d.type === "Revenu").reduce((acc, row) => acc + (row.montant || 0), 0);
  const Autres_Couts = financeData.filter(d => d.type === "Coût").reduce((acc, row) => acc + (row.montant || 0), 0);

  // EBITDA & Margin
  const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts;
  const Marge = CA_Total > 0 ? ((EBITDA / CA_Total) * 100).toFixed(1) : 0;

  const handleReset = () => {
     resetAllData();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Résumé Consolidé</Text>

      <View style={styles.kpiContainer}>
        <KPI title="CA Total" value={`${CA_Total.toLocaleString()} CFA`} />
        <KPI title="EBITDA" value={`${EBITDA.toLocaleString()} CFA`} />
        <KPI title="Marge OP" value={`${Marge} %`} />
        <KPI title="Taux d'Occup." value={`${Taux_Occ} %`} />
        <KPI title="Food Cost" value={`${Food_Cost} %`} />
        <KPI title="Coûts RH" value={`${Couts_RH.toLocaleString()} CFA`} />
      </View>

      <Text style={styles.chartTitle}>Répartition du Chiffre d'Affaires</Text>
      <PieChart
        data={[
          { name: "Hébergement", population: CA_Hebergement, color: "#0f3460", legendFontColor: "#7F7F7F", legendFontSize: 12 },
          { name: "Restauration", population: CA_Restaurant, color: "#e94560", legendFontColor: "#7F7F7F", legendFontSize: 12 },
          { name: "Autres", population: Autres_Revenus, color: "#f0a500", legendFontColor: "#7F7F7F", legendFontSize: 12 }
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
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Hotel")}>
            <FontAwesome5 name="bed" size={24} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.btnText}>Hébergement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Restaurant")}>
            <MaterialIcons name="restaurant" size={24} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.btnText}>Restaurant</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("HR")}>
            <FontAwesome5 name="users" size={24} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.btnText}>Ressources Humaines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Finance")}>
            <FontAwesome5 name="chart-line" size={24} color="#fff" style={{ marginBottom: 5 }} />
            <Text style={styles.btnText}>Finance / Autres</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { width: "100%", backgroundColor: "#e94560", flexDirection: "row", justifyContent: "center" }]} onPress={() => navigation.navigate("Insights")}>
            <FontAwesome5 name="brain" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13, marginTop: 2 }}>Intelligence Exécutive (SAP)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Réinitialiser la Base de Données Locale</Text>
      </TouchableOpacity>
      
      <View style={{height: 70}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e", marginBottom: 20 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#333", marginTop: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  actionBtn: { backgroundColor: "#0f3460", padding: 15, borderRadius: 8, width: "48%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  resetBtn: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginTop: 40, borderWidth: 1, borderColor: "red", alignItems: "center" },
  resetText: { color: "red", fontWeight: "bold" }
});
