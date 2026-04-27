import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { DataContext } from "../context/DataContext";

export default function InsightsScreen() {
  const { roomsData, restaurantData, hrData, financeData } = useContext(DataContext);

  // 1. Data Aggregation
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

  // 2. Extrapolation (Monthly Projection based on daily entries)
  // To avoid dividing by zero if there's no data, we assume at least 1 day recorded.
  let daysRecorded = new Set([...roomsData.map(d=>d.date), ...restaurantData.map(d=>d.date)]).size;
  if(daysRecorded === 0) daysRecorded = 1;
  
  const projectedMonthlyCA = (CA_Total / daysRecorded) * 30;
  const projectedMonthlyEBITDA = (EBITDA / daysRecorded) * 30;

  // 3. Logic Engine & Target Rules
  const insights = [];

  if (chambresOccupees === 0 && CA_Restaurant === 0) {
     insights.push({ title: "Aucune donnée", text: "Veuillez entrer des données dans les modules Hébergement ou Restaurant.", type: "neutral" });
  } else {
      // Rule 1: Occupancy Target 65%
      if (Taux_Occ >= 65) {
        insights.push({ title: "🌟 Excellente Occupation", text: `Taux à ${Taux_Occ}%. Continuez votre gestion tarifaire dynamique (Yield Management).`, type: "good" });
      } else {
        insights.push({ title: "⚠️ Occupation Faible", text: `Taux à ${Taux_Occ}% (Cible: >65%). Recommandation: Lancez des campagnes marketing, proposez des forfaits ou réajustez l'ADR.`, type: "bad" });
      }

      // Rule 2: Food Cost Target 30%
      if (CA_Restaurant > 0) {
          if (Food_Cost <= 30) {
              insights.push({ title: "🌟 Food Cost Optimal", text: `Food Cost très rentable à ${Food_Cost}%.`, type: "good" });
          } else {
              insights.push({ title: "🚨 Alerte Food Cost", text: `Food cost trop élevé à ${Food_Cost}% (Cible <30%). Recommandation: Auditez les gaspillages (démarques), renégociez avec les fournisseurs, et limitez les portions.`, type: "bad" });
          }
      }

      // Rule 3: Payroll / Masse Salariale Target 35%
      if (Couts_RH > 0) {
          if (ratioMasse <= 35) {
              insights.push({ title: "🌟 Masse Salariale Saine", text: `Le ratio au CA est de ${ratioMasse}%.`, type: "good" });
          } else {
              insights.push({ title: "⚠️ Surchauffe Salariale", text: `Masse salariale à ${ratioMasse}% du CA (Cible <35%). Recommandation: Évitez les heures supplémentaires inutiles et optimisez le planning inter-équipes.`, type: "bad" });
          }
      }

      // Rule 4: EBITDA Health
      if (CA_Total > 0) {
          if (Marge >= 25) {
              insights.push({ title: "🏆 Super Rentabilité", text: `Votre marge EBE (EBITDA) est de ${Marge}%. Gestion hautement efficace.`, type: "good" });
          } else if (Marge > 0) {
              insights.push({ title: "⚠️ Marge à surveiller", text: `Marge de ${Marge}% (Cible: >25%). Recommandation: Réduisez les coûts fixes et vendez plus d'options à marge forte (chambres suites, boissons).`, type: "neutral" });
          } else {
              insights.push({ title: "🚨 URGENCE: Secteur Déficitaire", text: `Vos coûts dépassent vos revenus (Marge de ${Marge}%). Bloquez immédiatement les dépenses discrétionnaires!`, type: "critical" });
          }
      }
  }

  const renderIcon = (type) => {
      switch(type) {
          case 'good': return { borderColor: '#4CAF50', color: '#4CAF50' };
          case 'bad': return { borderColor: '#FF9800', color: '#FF9800' };
          case 'critical': return { borderColor: '#F44336', color: '#F44336' };
          default: return { borderColor: '#2196F3', color: '#2196F3' };
      }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tableau de Bord Exécutif</Text>
      <Text style={styles.subtitle}>Intelligence d'Affaires & IA</Text>

      <Text style={styles.sectionTitle}>🔮 Projections sur 30 Jours</Text>
      <View style={styles.projectionBox}>
         <View style={styles.projRow}>
            <Text style={styles.projLabel}>CA Mensuel Projeté</Text>
            <Text style={styles.projValue}>{Math.round(projectedMonthlyCA).toLocaleString()} CFA</Text>
         </View>
         <View style={[styles.projRow, { borderBottomWidth: 0, marginTop: 10 }]}>
            <Text style={styles.projLabel}>EBITDA Mensuel Projeté</Text>
            <Text style={[styles.projValue, { color: projectedMonthlyEBITDA >= 0 ? 'green' : 'red'}]}>
              {Math.round(projectedMonthlyEBITDA).toLocaleString()} CFA
            </Text>
         </View>
      </View>

      <Text style={styles.sectionTitle}>💡 Alertes & Recommandations</Text>
      {insights.map((item, index) => {
          const styleType = renderIcon(item.type);
          return (
            <View key={index} style={[styles.insightCard, { borderLeftColor: styleType.borderColor }]}>
               <Text style={[styles.cardTitle, { color: styleType.color }]}>{item.title}</Text>
               <Text style={styles.cardText}>{item.text}</Text>
            </View>
          )
      })}
      
      <View style={{height: 70}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#e94560", marginBottom: 15, marginTop: 10 },
  projectionBox: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginBottom: 30, elevation: 2 },
  projRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderColor: "#eee", paddingBottom: 10 },
  projLabel: { fontSize: 16, color: "#333", fontWeight: "600" },
  projValue: { fontSize: 16, fontWeight: "bold", color: "#0f3460" },
  insightCard: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 5, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  cardText: { fontSize: 14, color: "#444", lineHeight: 20 }
});
