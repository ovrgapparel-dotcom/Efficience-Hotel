import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DataContext } from "../context/DataContext";
import KPI from "../components/KPI";

export default function FinanceScreen() {
  const { financeData, addFinanceRow } = useContext(DataContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("Coût"); // Revenu ou Coût
  const [depart, setDepart] = useState("Général");
  const [desc, setDesc] = useState("");
  const [montant, setMontant] = useState("");
  const [paiement, setPaiement] = useState("Virement");

  const handleAdd = () => {
    if (!montant || !desc) return;
    addFinanceRow({
      id: Date.now().toString(),
      date, type, departement: depart, description: desc, montant: Number(montant), paiement
    });
    setDesc(""); setMontant("");
  };

  const totalRevenus = financeData.filter(d => d.type === "Revenu").reduce((acc, r) => acc + r.montant, 0);
  const totalCouts = financeData.filter(d => d.type === "Coût").reduce((acc, r) => acc + r.montant, 0);
  const ebitdaJournalier = totalRevenus - totalCouts;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Finance & Trésorerie</Text>
      
      <View style={styles.kpiContainer}>
        <KPI title="Revenus Extra" value={`${totalRevenus.toLocaleString()} CFA`} />
        <KPI title="Coûts Divers" value={`${totalCouts.toLocaleString()} CFA`} />
        <KPI title="EBITDA Dept" value={`${ebitdaJournalier.toLocaleString()} CFA`} />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Saisie Comptable</Text>
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Type (Revenu / Coût)" value={type} onChangeText={setType} />
        <TextInput style={styles.input} placeholder="Département / Poste" value={depart} onChangeText={setDepart} />
        <TextInput style={styles.input} placeholder="Description" value={desc} onChangeText={setDesc} />
        <TextInput style={styles.input} placeholder="Montant (FCFA)" value={montant} onChangeText={setMontant} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Mode de paiement" value={paiement} onChangeText={setPaiement} />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Enregistrer Transaction</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Registre Quotidien</Text>
      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.col}>Date</Text>
            <Text style={styles.col}>Type</Text>
            <Text style={styles.col}>Poste</Text>
            <Text style={styles.col}>Description</Text>
            <Text style={styles.col}>Montant</Text>
            <Text style={styles.col}>Paiement</Text>
          </View>
          {financeData.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.col}>{row.date}</Text>
              <Text style={[styles.col, {color: row.type === 'Revenu' ? 'green' : 'red'}]}>{row.type}</Text>
              <Text style={styles.col}>{row.departement}</Text>
              <Text style={styles.col}>{row.description}</Text>
              <Text style={styles.col}>{row.montant}</Text>
              <Text style={styles.col}>{row.paiement}</Text>
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
