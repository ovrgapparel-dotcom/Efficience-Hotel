import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function KPI({ title, value }) {
  const { isDark, colors } = useContext(ThemeContext);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: isDark ? "#fff" : "#000" }]}>
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center"
  },
  title: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  value: { fontSize: 16, fontWeight: "bold" }
});
