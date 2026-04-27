import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import API from "../services/api";

export default function HistoryScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/simulations")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching history", err);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.type}>Simulation {item.type.toUpperCase()}</Text>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      {item.type === "hotel" && (
        <Text style={styles.details}>CA: {item.data.CA}$ • RevPAR: {item.data.RevPAR}$</Text>
      )}
      {item.type === "restaurant" && (
        <Text style={styles.details}>CA: {item.data.CA}$ • Marge: {item.data.marge}$</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0f3460" />
      ) : data.length === 0 ? (
        <Text style={styles.empty}>Aucune simulation trouvée.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fc" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#1a1a2e" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#e1e1e1" },
  type: { fontSize: 16, fontWeight: "bold", color: "#0f3460" },
  date: { fontSize: 12, color: "#666", marginBottom: 5 },
  details: { fontSize: 14, color: "#333", marginTop: 5 },
  empty: { textAlign: "center", color: "#888", marginTop: 20 }
});
