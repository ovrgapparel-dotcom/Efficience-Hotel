import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function KPI({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  value: {
    fontSize: 24,
    marginTop: 5,
    fontWeight: "bold",
    color: "#333",
  }
});
