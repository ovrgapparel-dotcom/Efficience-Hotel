import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DataContext } from "../context/DataContext";
import KPI from "../components/KPI";

export default function HrScreen() {
  const { hrData, addHrRow, roomsData, restaurantData } = useContext(DataContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nom, setNom] = useState("");
  const [poste, setPoste] = useState("");
  const [heures, setHeures] = useState("");
  const [taux, setTaux] = useState("");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!nom || !heures || !taux) return;
    const salaire = Number(heures) * Number(taux);
    addHrRow({
      id: Date.now().toString(),
      date, nom, poste, heures: Number(heures), taux: Number(taux), salaire, remarques
    });
    setNom(""); setPoste(""); setHeures(""); setTaux("");
  };

  const totalRevenuHotel = roomsData.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalRevenuResto = restaurantData.reduce((acc, r) => acc + (r.ventes || 0), 0);
  const CA_TOTAL = totalRevenuHotel + totalRevenuResto;

  const coutTotalMO = hrData.reduce((acc, r) => acc + r.salaire, 0);
  const heuresTotales = hrData.reduce((acc, r) => acc + r.heures, 0);

  const productivite = heuresTotales > 0 ? (CA_TOTAL / heuresTotales).toFixed(0) : 0;
  const ratioMasse = CA_TOTAL > 0 ? ((coutTotalMO / CA_TOTAL) * 100).toFixed(1) : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>RH - Pointage Quotidien</Text>
      
      <View style={styles.kpiContainer}>
        <KPI title="Coût Total MO" value={`${coutTotalMO.toLocaleString()} CFA`} />
        <KPI title="Heures Totales" value={`${heuresTotales} H`} />
        <KPI title="Productivité" value={`${Number(productivite).toLocaleString()} CFA/H`} />
        <KPI title="Ratio MS" value={`${ratioMasse} %`} />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Nouvelle Entrée</Text>
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Nom de l'employé" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Poste (Réception, Ménage...)" value={poste} onChangeText={setPoste} />
        <TextInput style={styles.input} placeholder="Heures travaillées" value={heures} onChangeText={setHeures} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Taux horaire (FCFA)" value={taux} onChangeText={setTaux} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Enregistrer Pointage</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Historique Quotidien</Text>
      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.col}>Date</Text>
            <Text style={styles.col}>Employé</Text>
            <Text style={styles.col}>Poste</Text>
            <Text style={styles.col}>Heures</Text>
            <Text style={styles.col}>Taux</Text>
            <Text style={styles.col}>Salaire J.</Text>
          </View>
          {hrData.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.col}>{row.date}</Text>
              <Text style={styles.col}>{row.nom}</Text>
              <Text style={styles.col}>{row.poste}</Text>
              <Text style={styles.col}>{row.heures}</Text>
              <Text style={styles.col}>{row.taux}</Text>
              <Text style={styles.col}>{row.salaire}</Text>
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
  col: { width: 100, textAlign: "center", fontSize: 12 }
});
