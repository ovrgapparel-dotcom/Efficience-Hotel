import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import DynamicButton from "../components/DynamicButton";
import { FontAwesome5 } from "@expo/vector-icons";

export default function InsightsScreen() {
  const { roomsData, restaurantData, hrData, financeData } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  // --- Data Aggregation ---
  const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
  const totalChambres = 40;
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const Taux_Occ = totalChambres > 0 ? ((chambresOccupees / totalChambres) * 100).toFixed(1) : 0;

  const CA_Restaurant = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);
  const Cout_Mat = restaurantData.reduce((acc, row) => acc + (row.coutMatiere || 0), 0);
  const Food_Cost = CA_Restaurant > 0 ? ((Cout_Mat / CA_Restaurant) * 100).toFixed(1) : 0;

  const CA_Total = CA_Hebergement + CA_Restaurant;
  const Couts_RH = hrData.reduce((acc, row) => acc + (row.salaire || 0), 0);
  const ratioMasse = CA_Total > 0 ? ((Couts_RH / CA_Total) * 100).toFixed(1) : 0;

  const Autres_Revenus = financeData.filter(d => d.type === "Revenu").reduce((acc, row) => acc + (row.montant || 0), 0);
  const Autres_Couts = financeData.filter(d => d.type === "Coût").reduce((acc, row) => acc + (row.montant || 0), 0);
  const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts;
  const Marge = CA_Total > 0 ? ((EBITDA / CA_Total) * 100).toFixed(1) : 0;

  // --- Projections ---
  let daysRecorded = new Set([...roomsData.map(d => d.date), ...restaurantData.map(d => d.date)]).size;
  if (daysRecorded === 0) daysRecorded = 1;
  const projectedMonthlyCA = (CA_Total / daysRecorded) * 30;
  const projectedMonthlyEBITDA = (EBITDA / daysRecorded) * 30;

  // --- Logic Engine ---
  const insights = [];
  if (chambresOccupees === 0 && CA_Restaurant === 0) {
    insights.push({ title: "Aucune donnée", text: "Veuillez entrer des données dans les modules.", type: "neutral" });
  } else {
    if (Taux_Occ >= 65) insights.push({ title: "🌟 Excellente Occupation", text: `Taux à ${Taux_Occ}%. Continuez votre gestion tarifaire dynamique.`, type: "good" });
    else insights.push({ title: "⚠️ Occupation Faible", text: `Taux à ${Taux_Occ}% (Cible: >65%). Lancez des campagnes marketing.`, type: "bad" });

    if (CA_Restaurant > 0) {
      if (Food_Cost <= 30) insights.push({ title: "🌟 Food Cost Optimal", text: `Food Cost très rentable à ${Food_Cost}%.`, type: "good" });
      else insights.push({ title: "🚨 Alerte Food Cost", text: `Food cost à ${Food_Cost}% (Cible <30%). Auditez les gaspillages.`, type: "bad" });
    }
    if (Couts_RH > 0) {
      if (ratioMasse <= 35) insights.push({ title: "🌟 Masse Salariale Saine", text: `Le ratio au CA est de ${ratioMasse}%.`, type: "good" });
      else insights.push({ title: "⚠️ Surchauffe Salariale", text: `Masse salariale à ${ratioMasse}% (Cible <35%). Optimisez le planning.`, type: "bad" });
    }
    if (CA_Total > 0) {
      if (Marge >= 25) insights.push({ title: "🏆 Super Rentabilité", text: `Votre marge EBITDA est de ${Marge}%.`, type: "good" });
      else if (Marge > 0) insights.push({ title: "⚠️ Marge à surveiller", text: `Marge de ${Marge}% (Cible: >25%). Réduisez les coûts fixes.`, type: "neutral" });
      else insights.push({ title: "🚨 URGENCE: Secteur Déficitaire", text: `Coûts dépassent revenus (${Marge}%). Bloquez les dépenses!`, type: "critical" });
    }
  }

  const styleForType = (type) => {
    switch (type) {
      case 'good': return { borderColor: '#4CAF50', color: '#4CAF50' };
      case 'bad': return { borderColor: '#FF9800', color: '#FF9800' };
      case 'critical': return { borderColor: '#F44336', color: '#F44336' };
      default: return { borderColor: colors.primary, color: colors.primary };
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Tableau de Bord Exécutif</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Intelligence d'Affaires & IA Prédictive</Text>

      {/* Projections */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>🔮 Projections sur 30 Jours</Text>
      <View style={[styles.projectionBox, { backgroundColor: colors.card }]}>
        <View style={[styles.projRow, { borderColor: colors.border }]}>
          <Text style={[styles.projLabel, { color: colors.text }]}>CA Mensuel Projeté</Text>
          <Text style={[styles.projValue, { color: colors.primary }]}>{Math.round(projectedMonthlyCA).toLocaleString()} CFA</Text>
        </View>
        <View style={[styles.projRow, { borderBottomWidth: 0, marginTop: 10 }]}>
          <Text style={[styles.projLabel, { color: colors.text }]}>EBITDA Mensuel Projeté</Text>
          <Text style={[styles.projValue, { color: projectedMonthlyEBITDA >= 0 ? '#4CAF50' : '#ff6681' }]}>
            {Math.round(projectedMonthlyEBITDA).toLocaleString()} CFA
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <Text style={[styles.sectionTitle, { color: colors.secondary }]}>💡 Alertes & Recommandations</Text>
      {insights.map((item, index) => {
        const st = styleForType(item.type);
        return (
          <View key={index} style={[styles.insightCard, { backgroundColor: colors.card, borderLeftColor: st.borderColor }]}>
            <Text style={[styles.cardTitle, { color: st.color }]}>{item.title}</Text>
            <Text style={[styles.cardText, { color: colors.textMuted }]}>{item.text}</Text>
          </View>
        );
      })}

      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 5 },
  projectionBox: { padding: 20, borderRadius: 10, marginBottom: 24, elevation: 2 },
  projRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, paddingBottom: 10 },
  projLabel: { fontSize: 15, fontWeight: "600" },
  projValue: { fontSize: 15, fontWeight: "bold" },
  insightCard: { padding: 15, borderRadius: 8, marginBottom: 14, borderLeftWidth: 5, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  cardText: { fontSize: 13, lineHeight: 20 }
});
