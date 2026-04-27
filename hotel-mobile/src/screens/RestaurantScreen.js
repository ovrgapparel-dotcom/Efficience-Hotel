import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import API from "../services/api";

export default function RestaurantScreen({ navigation }) {
  const [couverts, setCouverts] = useState("120");
  const [ticket, setTicket] = useState("45");
  const [foodCost, setFoodCost] = useState("0.38");

  const handleSubmit = async () => {
    try {
      const res = await API.post("/restaurant/simulate", {
        couverts: Number(couverts),
        ticket: Number(ticket),
        foodCost: Number(foodCost)
      });
      
      // Save it automatically
      await API.post("/simulations/save", {
        type: "restaurant",
        data: res.data
      });

      navigation.navigate("Dashboard", { restaurantData: res.data });
    } catch (error) {
       Alert.alert("Error", "Server error processing simulation");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulation Restaurant</Text>

      <Text style={styles.label}>Couverts Jouliers</Text>
      <TextInput style={styles.input} placeholder="e.g. 120" value={couverts} onChangeText={setCouverts} keyboardType="numeric" />
      
      <Text style={styles.label}>Ticket Moyen ($)</Text>
      <TextInput style={styles.input} placeholder="e.g. 45" value={ticket} onChangeText={setTicket} keyboardType="numeric" />
      
      <Text style={styles.label}>Food Cost (%)</Text>
      <TextInput style={styles.input} placeholder="e.g. 0.38" value={foodCost} onChangeText={setFoodCost} keyboardType="numeric" />

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
