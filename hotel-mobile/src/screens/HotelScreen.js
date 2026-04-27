import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { DataContext } from "../context/DataContext";
import KPI from "../components/KPI";

export default function HotelScreen() {
  const { roomsData, addRoomRow } = useContext(DataContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chambreNo, setChambreNo] = useState("");
  const [type, setType] = useState("");
  const [client, setClient] = useState("");
  const [statut, setStatut] = useState("Occupée");
  const [prixNuit, setPrixNuit] = useState("");
  const [nuits, setNuits] = useState("1");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!chambreNo || !prixNuit) return;
    const total = Number(prixNuit) * Number(nuits);
    addRoomRow({
      id: Date.now().toString(),
      date, chambreNo, type, client, statut, 
      prixNuit: Number(prixNuit), nuits: Number(nuits), total, remarques
    });
    setChambreNo(""); setClient(""); setPrixNuit("");
  };

  const totalRevenu = roomsData.reduce((acc, row) => acc + row.total, 0);
  const totalNuits = roomsData.reduce((acc, row) => acc + row.nuits, 0);
  const uniqueClients = new Set(roomsData.map(r => r.client).filter(c => c)).size;
  const dms = uniqueClients > 0 ? (totalNuits / uniqueClients).toFixed(1) : 0;
  
  const TOTAL_CHAMBRES = 40; 
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const tauxOcc = ((chambresOccupees / TOTAL_CHAMBRES) * 100).toFixed(1);
  const revpar = TOTAL_CHAMBRES > 0 ? (totalRevenu / TOTAL_CHAMBRES).toFixed(0) : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hébergement - Saisie Quotidienne</Text>
      
      <View style={styles.kpiContainer}>
        <KPI title="Tx Occup." value={`${tauxOcc}%`} />
        <KPI title="Revenu" value={`${totalRevenu.toLocaleString()} CFA`} />
        <KPI title="RevPAR" value={`${Number(revpar).toLocaleString()} CFA`} />
        <KPI title="DMS" value={`${dms} N`} />
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionHeader}>Nouvelle Entrée</Text>
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={styles.input} placeholder="Chambre N°" value={chambreNo} onChangeText={setChambreNo} />
        <TextInput style={styles.input} placeholder="Type (Standard, Suite...)" value={type} onChangeText={setType} />
        <TextInput style={styles.input} placeholder="Nom du Client" value={client} onChangeText={setClient} />
        <TextInput style={styles.input} placeholder="Statut" value={statut} onChangeText={setStatut} />
        <TextInput style={styles.input} placeholder="Prix/Nuit (FCFA)" value={prixNuit} onChangeText={setPrixNuit} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Nuits" value={nuits} onChangeText={setNuits} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Enregistrer la Nuitée</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Historique Quotidien</Text>
      <ScrollView horizontal style={styles.tableScroll}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.col}>Date</Text>
            <Text style={styles.col}>Ch N°</Text>
            <Text style={styles.col}>Client</Text>
            <Text style={styles.col}>Statut</Text>
            <Text style={styles.col}>Px/Nuit</Text>
            <Text style={styles.col}>Nuits</Text>
            <Text style={styles.col}>Total (FCFA)</Text>
          </View>
          {roomsData.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.col}>{row.date}</Text>
              <Text style={styles.col}>{row.chambreNo}</Text>
              <Text style={styles.col}>{row.client}</Text>
              <Text style={styles.col}>{row.statut}</Text>
              <Text style={styles.col}>{row.prixNuit}</Text>
              <Text style={styles.col}>{row.nuits}</Text>
              <Text style={styles.col}>{row.total}</Text>
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
  title: { fontSize: 20, fontWeight: "bold", color: "#1a1a2e", marginBottom: 15 },
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
