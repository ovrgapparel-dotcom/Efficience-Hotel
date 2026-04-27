import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import API from "../services/api";

export default function HotelScreen({ navigation }) {
  // Rooms
  const [rooms, setRooms] = useState("40");
  const [occupancy, setOccupancy] = useState("0.65");
  const [adr, setAdr] = useState("85");

  // F&B
  const [fbCovers, setFbCovers] = useState("1000");
  const [fbCheck, setFbCheck] = useState("25");
  const [fbCostPerc, setFbCostPerc] = useState("30");

  // Other Revenue
  const [spaRevenue, setSpaRevenue] = useState("5000");
  const [eventsRevenue, setEventsRevenue] = useState("12000");

  // Variable Costs
  const [payrollPerc, setPayrollPerc] = useState("25");
  const [maintenance, setMaintenance] = useState("4000");
  const [utilities, setUtilities] = useState("3000");

  // Fixed Costs
  const [rent, setRent] = useState("15000");
  const [marketing, setMarketing] = useState("2000");
  const [insurance, setInsurance] = useState("1000");

  const handleSubmit = async () => {
    try {
      const payload = {
        rooms: Number(rooms), occupancy: Number(occupancy), adr: Number(adr),
        fbCovers: Number(fbCovers), fbCheck: Number(fbCheck), fbCostPerc: Number(fbCostPerc),
        spaRevenue: Number(spaRevenue), eventsRevenue: Number(eventsRevenue),
        payrollPerc: Number(payrollPerc), maintenance: Number(maintenance), utilities: Number(utilities),
        rent: Number(rent), marketing: Number(marketing), insurance: Number(insurance)
      };

      const res = await API.post("/hotel/simulate-advanced", payload);
      
      navigation.navigate("Dashboard", { hotelData: res.data });
    } catch (error) {
       Alert.alert("Erreur", "Le calcul a échoué.");
       console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Projection P&L Avancée</Text>

      <Text style={styles.sectionHeader}>Hébergement</Text>
      <TextInput style={styles.input} placeholder="Nombre Chambres" value={rooms} onChangeText={setRooms} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Taux d'occupation (ex: 0.65)" value={occupancy} onChangeText={setOccupancy} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Prix Moyen (ADR)" value={adr} onChangeText={setAdr} keyboardType="numeric" />

      <Text style={styles.sectionHeader}>Restauration (F&B)</Text>
      <TextInput style={styles.input} placeholder="Couverts (mensuel)" value={fbCovers} onChangeText={setFbCovers} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Ticket Moyen" value={fbCheck} onChangeText={setFbCheck} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Food Cost (%)" value={fbCostPerc} onChangeText={setFbCostPerc} keyboardType="numeric" />

      <Text style={styles.sectionHeader}>Autres Revenus (Mensuel)</Text>
      <TextInput style={styles.input} placeholder="Revenus Spa" value={spaRevenue} onChangeText={setSpaRevenue} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Revenus Banquets/Events" value={eventsRevenue} onChangeText={setEventsRevenue} keyboardType="numeric" />

      <Text style={styles.sectionHeader}>Coûts Opérationnels</Text>
      <TextInput style={styles.input} placeholder="Masse Salariale (%)" value={payrollPerc} onChangeText={setPayrollPerc} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Coûts de Maintenance" value={maintenance} onChangeText={setMaintenance} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Utilitaires (Eau, Elec)" value={utilities} onChangeText={setUtilities} keyboardType="numeric" />

      <Text style={styles.sectionHeader}>Coûts Fixes</Text>
      <TextInput style={styles.input} placeholder="Loyer" value={rent} onChangeText={setRent} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Marketing" value={marketing} onChangeText={setMarketing} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Assurances" value={insurance} onChangeText={setInsurance} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Calculer le P&L Global</Text>
      </TouchableOpacity>
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fc" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1a1a2e" },
  sectionHeader: { fontSize: 16, fontWeight: "bold", color: "#e94560", marginTop: 15, marginBottom: 10 },
  input: { backgroundColor: "#fff", height: 45, borderRadius: 8, paddingHorizontal: 15, marginBottom: 10, borderWidth: 1, borderColor: "#e1e1e1" },
  button: { backgroundColor: "#0f3460", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
