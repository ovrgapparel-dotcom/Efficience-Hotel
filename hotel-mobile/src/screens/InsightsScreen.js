import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from "react-native";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { AIEngine } from "../services/AIEngine";

export default function InsightsScreen() {
  const { roomsData, restaurantData, hrData, financeData, housekeepingData, consumablesData, systemSettings } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [isProcessing, setIsProcessing] = useState(true);
  const [insights, setInsights] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const runAnalysis = () => {
    setIsProcessing(true);
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();

    setTimeout(() => {
      const generatedInsights = AIEngine.analyze({ roomsData, restaurantData, hrData, financeData, housekeepingData, consumablesData, systemSettings });
      setInsights(generatedInsights);
      setIsProcessing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, 2500); // Simulate AI processing time
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const getSeverityColor = (severity) => {
    if (severity === 'good') return '#1a6b3c';
    if (severity === 'bad') return '#f0ad4e';
    if (severity === 'critical') return '#d9534f';
    return colors.primary;
  };

  if (isProcessing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <FontAwesome5 name="brain" size={60} color="#1a6b3c" style={{ marginBottom: 20 }} />
        <ActivityIndicator size="large" color="#1a6b3c" />
        <Text style={{ marginTop: 20, color: colors.text, fontSize: 16, fontWeight: 'bold' }}>Traitement Neuronal en Cours...</Text>
        <Text style={{ marginTop: 10, color: colors.textMuted, fontSize: 13 }}>Analyse des flux de données multidimensionnels</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Intelligence Exécutive</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Diagnostic Opérationnel & IA Prédictive</Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>💡 Résumé Analytique</Text>
        {insights.map((item, index) => {
          const colorCode = getSeverityColor(item.severity);
          return (
            <View key={index} style={[styles.insightCard, { backgroundColor: colors.card, borderLeftColor: colorCode }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <FontAwesome5 name={item.icon || 'info-circle'} size={18} color={colorCode} style={{ marginRight: 10 }} />
                <Text style={[styles.cardTitle, { color: colorCode }]}>{item.title}</Text>
              </View>
              <Text style={[styles.cardText, { color: colors.textMuted }]}>{item.text}</Text>
              
              {item.action && (
                <View style={{ marginTop: 15, alignSelf: 'flex-start', backgroundColor: colorCode + '20', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 }}>
                  <Text style={{ color: colorCode, fontWeight: 'bold', fontSize: 11 }}>ACT: {item.action.toUpperCase()}</Text>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity onPress={runAnalysis} style={styles.reanalyzeBtn}>
          <FontAwesome5 name="sync" size={14} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Forcer une Nouvelle Analyse</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 5 },
  reanalyzeBtn: { flexDirection: 'row', backgroundColor: '#1a6b3c', padding: 15, borderRadius: 8, justifyContent: 'center', marginTop: 20, alignItems: 'center' }
});
