import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import KPI from "../components/KPI";

export default function DashboardScreen({ route, navigation }) {
  const { hotelData, restaurantData } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Overview Dashboard</Text>

      <View style={styles.kpiContainer}>
        {hotelData ? (
          hotelData.summary ? (
            <>
              <KPI title="CA Total" value={`${Math.round(hotelData.revenues.totalRev)} $`} />
              <KPI title="GOP" value={`${Math.round(hotelData.summary.gop)} $`} />
              <KPI title="NOI (Bénéfice Net)" value={`${Math.round(hotelData.summary.noi)} $`} />
            </>
          ) : (
            <>
              <KPI title="CA Hôtel" value={`${hotelData.CA} $`} />
              <KPI title="RevPAR" value={`${hotelData.RevPAR} $`} />
            </>
          )
        ) : (
          <Text style={styles.emptyText}>Aucune donnée Hôtel simuleé.</Text>
        )}

        {restaurantData ? (
          <>
            <KPI title="CA Restaurant" value={`${restaurantData.CA} $`} />
            <KPI title="Marge" value={`${restaurantData.marge} $`} />
          </>
        ) : (
          <Text style={styles.emptyText}>Aucune donnée Restaurant simuleé.</Text>
        )}
      </View>

      {hotelData && hotelData.summary ? (
        <>
          <Text style={styles.chartTitle}>Répartition des Revenus</Text>
          <PieChart
            data={[
              { name: "Chambres", population: Math.round(hotelData.revenues.roomRev), color: "#0f3460", legendFontColor: "#7F7F7F", legendFontSize: 12 },
              { name: "F&B", population: Math.round(hotelData.revenues.fbRev), color: "#e94560", legendFontColor: "#7F7F7F", legendFontSize: 12 },
              { name: "Autres", population: Math.round(hotelData.revenues.spaRevenue + hotelData.revenues.eventsRevenue), color: "#f0a500", legendFontColor: "#7F7F7F", legendFontSize: 12 }
            ]}
            width={Dimensions.get("window").width - 40}
            height={200}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            absolute
          />
        </>
      ) : (
        <>
          <Text style={styles.chartTitle}>Performance Growth</Text>
          <LineChart
            data={{
              labels: ["Jan", "Fev", "Mar", "Avr"],
              datasets: [{ data: [15000, 20000, 18000, 25000] }]
            }}
            width={Dimensions.get("window").width - 40}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#f7f9fc",
              backgroundGradientTo: "#e6eef5",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(15, 52, 96, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#0f3460" }
            }}
            bezier
            style={{ marginVertical: 15, borderRadius: 16 }}
          />
        </>
      )}
      
      <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Hotel")}>
              <Text style={styles.btnText}>Simuler Hôtel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Restaurant")}>
              <Text style={styles.btnText}>Simuler Resto</Text>
          </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e", marginBottom: 20 },
  kpiContainer: { marginBottom: 20 },
  emptyText: { color: "#888", fontStyle: "italic", marginBottom: 10 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#333" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, marginBottom: 50 },
  actionBtn: { backgroundColor: "#0f3460", padding: 15, borderRadius: 8, width: "48%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold" }
});
