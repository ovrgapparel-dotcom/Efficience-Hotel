import React, { useContext, useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function KPI({ title, value, delay = 0, onPress }) {
  const { isDark, colors } = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, [delay]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ width: "48%" }}>
      <Animated.View style={[styles.card, {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        borderTopColor: colors.gold,
        shadowColor: colors.gold,
      }]}>
        <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    borderTopWidth: 3,
  },
  title: { fontSize: 11, fontWeight: "700", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: "bold" }
});
