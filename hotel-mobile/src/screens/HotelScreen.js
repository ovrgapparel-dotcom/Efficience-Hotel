import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import API from "../services/api";

export default function HotelScreen({ navigation }) {
  const [chambres, setChambres] = useState("40");
  const [taux, setTaux] = useState("0.65");
  const [prix, setPrix] = useState("85");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/hotel/simulate", {
        chambres: Number(chambres),
        taux: Number(taux),
        prix: Number(prix)
      });
      
      // Save it automatically
      await API.post("/simulations/save", {
        type: "hotel",
        data: res.data
      });

      navigation.navigate("Dashboard", { hotelData: res.data });
    } catch (error) {
       Alert.alert("Error", "Server error processing simulation");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulation Hôtel</Text>

      <Text style={styles.label}>Nombre de Chambres</Text>
      <TextInput style={styles.input} placeholder="e.g. 40" value={chambres} onChangeText={setChambres} keyboardType="numeric" />
      
      <Text style={styles.label}>Taux d'occupation (0 - 1)</Text>
      <TextInput style={styles.input} placeholder="e.g. 0.65" value={taux} onChangeText={setTaux} keyboardType="numeric" />
      
      <Text style={styles.label}>Prix Moyen ($)</Text>
      <TextInput style={styles.input} placeholder="e.g. 85" value={prix} onChangeText={setPrix} keyboardType="numeric" />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Calculer & Sauvegarder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fc" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1a1a2e" },
  label: { fontSize: 14, color: "#666", marginBottom: 5, fontWeight: "600" },
  input: { backgroundColor: "#fff", height: 50, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#e1e1e1" },
  button: { backgroundColor: "#0f3460", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
