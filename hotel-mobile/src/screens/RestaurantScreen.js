import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DataContext } from "../context/DataContext";
import KPI from "../components/KPI";

export default function RestaurantScreen() {
  const { restaurantData, addRestoRow } = useContext(DataContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [service, setService] = useState("Déjeuner");
  const [couverts, setCouverts] = useState("");
  const [ventes, setVentes] = useState("");
  const [coutMatiere, setCoutMatiere] = useState("");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!ventes || !couverts) return;
    const foodCostPerc = ((Number(coutMatiere) / Number(ventes)) * 100).toFixed(1);
    addRestoRow({
      id: Date.now().toString(),
      date, service, couverts: Number(couverts),
      ventes: Number(ventes), coutMatiere: Number(coutMatiere), foodCostPerc, remarques
    });
    setCouverts(""); setVentes(""); setCoutMatiere("");
  };

  const totalVentes = restaurantData.reduce((acc, row) => acc + row.ventes, 0);
  const totalCouverts = restaurantData.reduce((acc, row) => acc + row.couverts, 0);
  const totalCout = restaurantData.reduce((acc, row) => acc + row.coutMatiere, 0);
  
  const avgFoodCost = totalVentes > 0 ? ((totalCout / totalVentes) * 100).toFixed(1) : 0;
  const ticketMoyen = totalCouverts > 0 ? (totalVentes / totalCouverts).toFixed(0) : 0;
  const margeBrute = totalVentes > 0 ? (((totalVentes - totalCout) / totalVentes) * 100).toFixed(1) : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant - Saisie Quotidienne</Text>
      
      <View style={styles.kpiContainer}>
        <KPI title="CA Total" value={`${totalVentes.toLocaleString()} CFA`} />
        <KPI title="Food Cost" value={`${avgFoodCost} %`} />
        <KPI title="Ticket Moy." value={`${Number(ticketMoyen).toLocaleString()} CFA`} />
        <KPI title="Marge Brute" value={`${margeBrute} %`} />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Nouvelle Entrée</Text>
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Service (Déj./Dîner)" value={service} onChangeText={setService} />
        <TextInput style={styles.input} placeholder="Nombre de couverts" value={couverts} onChangeText={setCouverts} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Ventes (FCFA)" value={ventes} onChangeText={setVentes} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Coût matières (FCFA)" value={coutMatiere} onChangeText={setCoutMatiere} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Enregistrer le Service</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Historique Quotidien</Text>
      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.col}>Date</Text>
            <Text style={styles.col}>Service</Text>
            <Text style={styles.col}>Couverts</Text>
            <Text style={styles.col}>Ventes</Text>
            <Text style={styles.col}>Coûts M.</Text>
            <Text style={styles.col}>FC %</Text>
          </View>
          {restaurantData.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.col}>{row.date}</Text>
              <Text style={styles.col}>{row.service}</Text>
              <Text style={styles.col}>{row.couverts}</Text>
              <Text style={styles.col}>{row.ventes}</Text>
              <Text style={styles.col}>{row.coutMatiere}</Text>
              <Text style={styles.col}>{row.foodCostPerc}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f7f9fc" },
  title: { fontSize: 20, fontWeight: "bold", color: "#1a1a2e", marginVertical: 15 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  form: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#e94560" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 10 },
  button: { backgroundColor: "#0f3460", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  tableScroll: { backgroundColor: "#fff", padding: 10, borderRadius: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, borderColor: "#e94560", paddingBottom: 10, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee", paddingVertical: 10 },
  col: { width: 90, textAlign: "center", fontSize: 12 }
});
