import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { NotificationService } from "../services/NotificationService";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import KPI from "../components/KPI";
import OnboardingModal from "../components/OnboardingModal";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";
import AppFooter from "../components/AppFooter";

const BANNER_DASHBOARD = require("../../assets/banners/banner_dashboard.png");

export default function DashboardScreen({ navigation }) {
  const { roomsData, restaurantData, hrData, financeData, inventoryData, monthlyInventoryCost, resetAllData, systemSettings, updateSettings } = useContext(DataContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);
  const { logout, pins, updatePin } = useContext(AuthContext);
  const [helpVisible, setHelpVisible] = useState(false);
  const [securityVisible, setSecurityVisible] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);

  const kpiDefinitions = {
    "CA Total": {
      formula: "Revenus Hébergement + Revenus Restaurant",
      desc: "Chiffre d'Affaires Total. Il s'agit du total consolidé de toutes les ventes de l'établissement (Nuitées + Consommations Bar/Restaurant)."
    },
    "EBITDA": {
      formula: "(CA Total + Autres Revenus) - (Coûts RH + Coûts + Amortissement Stock)",
      desc: "Bénéfice Brut d'Exploitation (Earnings Before Interest, Taxes, Depreciation, and Amortization). Indique la rentabilité opérationnelle brute de l'hôtel avant les charges financières."
    },
    "Marge OP": {
      formula: "(EBITDA / CA Total) * 100",
      desc: "Marge Opérationnelle en pourcentage. Représente la part du chiffre d'affaires convertie en bénéfice réel de fonctionnement."
    },
    "Taux d'Occup.": {
      formula: "(Chambres Occupées / Chambres Totales configurées) * 100",
      desc: "Taux d'Occupation. Exprime la densité de remplissage de l'hôtel par rapport à la capacité définie."
    },
    "Ratio Matière": {
      formula: "(Cout Matières / Ventes Restaurant) * 100",
      desc: "Autrefois appelé Food Cost. Indique le pourcentage des revenus de restauration qui est investi dans l'achat brut de nourriture et de boissons."
    },
    "Amort. Stock": {
      formula: "Somme de (Valeur Initiale de l'article / Durée d'Amortissement en mois)",
      desc: "Dépréciation mensuelle estimée du mobilier, de l'équipement lourd et des fournitures."
    }
  };

  const chartFade = useRef(new Animated.Value(0)).current;
  const chartScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(chartFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(chartScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  // --- Alert Watchdog ---
  useEffect(() => {
    const checkAlerts = async () => {
      // 1. Finance Alerts
      const income = financeData.filter(d => d.type === 'Revenu').reduce((acc, r) => acc + r.montant, 0);
      const expense = financeData.filter(d => d.type === 'Coût').reduce((acc, r) => acc + r.montant, 0);
      const ebitda = income - expense - monthlyInventoryCost;

      if (ebitda < 0 && financeData.length > 0) {
        await NotificationService.sendLocalNotification(
          "⚠️ ALERTE FINANCE",
          "Flux de trésorerie négatif détecté. Revue urgente des coûts recommandée."
        );
      }

      // 2. Inventory Alerts (Threshold: Item value < 5000 CFA considered 'low priority' or 'low stock')
      const lowStockItems = inventoryData.filter(i => i.valeurInitiale < 5000);
      if (lowStockItems.length > 0) {
        await NotificationService.sendLocalNotification(
          "📦 ALERTE STOCK",
          `Besoins de réapprovisionnement pour: ${lowStockItems.map(i => i.nom).join(', ')}`
        );
      }
    };

    if (financeData.length > 0 || inventoryData.length > 0) {
      checkAlerts();
    }
  }, [financeData, inventoryData]);

  const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
  const totalChambres = parseInt(systemSettings.roomsCapacity, 10) || 40; 
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const Taux_Occ = totalChambres > 0 ? ((chambresOccupees / totalChambres) * 100).toFixed(1) : 0;

  const CA_Restaurant = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);
  const Cout_Mat = restaurantData.reduce((acc, row) => acc + (row.coutMatiere || 0), 0);
  const Food_Cost = CA_Restaurant > 0 ? ((Cout_Mat / CA_Restaurant) * 100).toFixed(1) : 0;

  const CA_Total = CA_Hebergement + CA_Restaurant;

  const Couts_RH = hrData.reduce((acc, row) => acc + (row.salaire || 0), 0);
  const Autres_Revenus = financeData.filter(d => d.type === "Revenu").reduce((acc, row) => acc + (row.montant || 0), 0);
  const Autres_Couts = financeData.filter(d => d.type === "Coût").reduce((acc, row) => acc + (row.montant || 0), 0);

  // EBITDA calculates Revenue - (Payroll + Inventory Amort + Op Costs)
  const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts - monthlyInventoryCost;
  const Marge = CA_Total > 0 ? ((EBITDA / CA_Total) * 100).toFixed(1) : 0;

  // Alerts logic
  const alerts = [];
  if (parseFloat(Taux_Occ) > 85) alerts.push({ msg: "Occupation Exceptionnelle : Optimisez les tarifs", type: "success" });
  if (parseFloat(Food_Cost) > 35) alerts.push({ msg: "Ratio Matière Élevé : Vérifiez les stocks cuisine", type: "warning" });
  if (EBITDA < 0 && CA_Total > 0) alerts.push({ msg: "Alerte Rentabilité : EBITDA Négatif", type: "danger" });

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: 10 }} />

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_dashboard"
        title="Guide: Dashboard Principal"
        steps={[
          "KPIs Globaux: Surveillez le Taux d'Occupation, Revenus Globaux et votre rentabilité Nette en direct.",
          "Alertes: Restez alerté si le personnel est insuffisant ou si le stock s'épuise (Alertes Visuelles).",
          "Navigation: Utilisez les onglets ci-dessous pour gérer l'Hôtel, le Restaurant, les RH, la Finance, et les Stocks séparément."
        ]}
      />

      <DepartmentBanner
        image={BANNER_DASHBOARD}
        title="Résumé Consolidé"
        subtitle={today}
        icon={<FontAwesome5 name="hotel" size={26} color="#fff" />}
      />

      {/* Alert Center */}
      {alerts.length > 0 && (
        <View style={styles.alertCenter}>
          {alerts.map((a, i) => (
            <View key={i} style={[styles.alertItem, { borderLeftColor: a.type==='danger'?'#e94560':a.type==='warning'?'#f0a500':'#00d47e' }]}>
              <FontAwesome5 name={a.type==='danger'?'exclamation-circle':'info-circle'} size={14} color={colors.textMuted} />
              <Text style={{ color: colors.text, marginLeft: 8, fontSize: 13 }}>{a.msg}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.kpiContainer}>
        <KPI title="CA Total" value={`${CA_Total.toLocaleString()} CFA`} delay={100} onPress={() => setSelectedKpi("CA Total")} />
        <KPI title="EBITDA" value={`${EBITDA.toLocaleString()} CFA`} delay={200} onPress={() => setSelectedKpi("EBITDA")} />
        <KPI title="Marge OP" value={`${Marge} %`} delay={300} onPress={() => setSelectedKpi("Marge OP")} />
        <KPI title="Taux d'Occup." value={`${Taux_Occ} %`} delay={400} onPress={() => setSelectedKpi("Taux d'Occup.")} />
        <KPI title="Ratio Matière" value={`${Food_Cost} %`} delay={500} onPress={() => setSelectedKpi("Ratio Matière")} />
        <KPI title="Amort. Stock" value={`${Math.round(monthlyInventoryCost).toLocaleString()} CFA`} delay={600} onPress={() => setSelectedKpi("Amort. Stock")} />
      </View>

      <Text style={[styles.chartTitle, { color: colors.text }]}>Répartition du Chiffre d'Affaires</Text>
      <Animated.View style={{ opacity: chartFade, transform: [{ scale: chartScale }] }}>
        <PieChart
          data={[
            { name: "Hébergement", population: CA_Hebergement, color: colors.primaryHover, legendFontColor: colors.textMuted, legendFontSize: 12 },
            { name: "Restauration", population: CA_Restaurant, color: colors.secondary, legendFontColor: colors.textMuted, legendFontSize: 12 },
            { name: "Autres", population: Autres_Revenus, color: "#f0a500", legendFontColor: colors.textMuted, legendFontSize: 12 }
          ]}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          absolute
        />
      </Animated.View>

      <View style={styles.actions}>
        <DynamicButton title="Hébergement" onPress={() => navigation.navigate("Hotel")} icon={<FontAwesome5 name="bed" size={26} color="#fff" />} width="48%" color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}/>
        <DynamicButton title="Restaurant" onPress={() => navigation.navigate("Restaurant")} icon={<MaterialIcons name="restaurant" size={26} color="#fff" />} width="48%" color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}/>
      </View>
      <View style={styles.actions}>
        <DynamicButton title="Stock & Amort." onPress={() => navigation.navigate("Inventory")} icon={<FontAwesome5 name="archive" size={26} color="#fff" />} width="48%" color={colors.secondary} hoverColor={colors.secondaryHover} isDark={isDark}/>
        <DynamicButton title="Ressources" onPress={() => navigation.navigate("HR")} icon={<FontAwesome5 name="users" size={26} color="#fff" />} width="48%" color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}/>
      </View>
      <View style={styles.actions}>
        <DynamicButton title="Finance" onPress={() => navigation.navigate("Finance")} icon={<FontAwesome5 name="chart-line" size={26} color="#fff" />} width="48%" color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}/>
        <DynamicButton title="Rapports PDF" onPress={() => navigation.navigate("Reports")} icon={<FontAwesome5 name="file-pdf" size={26} color="#fff" />} width="48%" color={colors.secondary} hoverColor={colors.secondaryHover} isDark={isDark}/>
      </View>

      <View style={{ marginTop: 20 }}>
        <DynamicButton 
           title="Gestion Sécurité & PINs" 
           onPress={() => setSecurityVisible(!securityVisible)} 
           icon={<FontAwesome5 name="key" size={24} color="#fff" />} 
           width="100%" 
           color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
        />
      </View>

      {securityVisible && (
        <View style={[styles.securityPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 15, fontSize: 16 }}>Configuration Système & Sécurité</Text>
          
          <Text style={{ color: colors.secondary, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>🔑 Accès Services (PINs)</Text>
          {Object.keys(pins).map(role => (
            <View key={role} style={styles.pinRow}>
              <Text style={{ color: colors.textMuted, flex: 1 }}>{role}:</Text>
              <TextInput 
                style={[styles.pinDisplay, { color: colors.text, borderColor: colors.border }]}
                defaultValue={pins[role]}
                keyboardType="numeric"
                maxLength={4}
                onChangeText={(val) => { if(val.length === 4) updatePin(role, val); }}
              />
            </View>
          ))}

          <Text style={{ color: colors.secondary, fontWeight: 'bold', marginTop: 25, marginBottom: 5 }}>🏢 Capacités Opérationnelles</Text>
          <View style={styles.pinRow}>
             <Text style={{ color: colors.textMuted, flex: 1 }}>Chambres Totales :</Text>
             <TextInput 
                style={[styles.pinDisplay, { color: colors.text, borderColor: colors.border }]}
                defaultValue={String(systemSettings.roomsCapacity)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings({ roomsCapacity: val })}
              />
          </View>
          <View style={styles.pinRow}>
             <Text style={{ color: colors.textMuted, flex: 1 }}>Couverts Restaurant :</Text>
             <TextInput 
                style={[styles.pinDisplay, { color: colors.text, borderColor: colors.border }]}
                defaultValue={String(systemSettings.restaurantCapacity)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings({ restaurantCapacity: val })}
              />
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 15 }}>💡 Les modifications sont enregistrées automatiquement globalement.</Text>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <DynamicButton 
           title="Intelligence Exécutive (SAP)" 
           onPress={() => navigation.navigate("Insights")} 
           icon={<FontAwesome5 name="brain" size={32} color="#fff" />} 
           width="100%" 
           color={colors.secondary} hoverColor={colors.secondaryHover} isDark={isDark}
        />
      </View>

      <TouchableOpacity style={[styles.resetBtn, { borderColor: isDark ? "#ff6681" : "red" }]} onPress={() => {
        if(window.confirm("Êtes-vous sûr de vouloir réinitialiser toute la base de données (Hôtel, Resto, RH, Finance, Stock, Entretien, Clients) ? Cette action est irréversible.")) {
          resetAllData();
        }
      }}>
          <Text style={[styles.resetText, { color: isDark ? "#ff6681" : "red" }]}>Réinitialiser la Base de Données</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.testNotifyBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]} 
        onPress={() => NotificationService.sendLocalNotification("🔔 Test Système EH", "Les notifications push sont actives!")}
      >
          <FontAwesome5 name="bell" size={14} color={colors.primary} style={{ marginRight: 10 }} />
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Tester les Alertes Push</Text>
      </TouchableOpacity>
      
      <View style={{height: 70}} />
      <AppFooter />

      {/* KPI Explanation Modal */}
      {selectedKpi && kpiDefinitions[selectedKpi] && (
        <Modal animationType="fade" transparent={true} visible={true} onRequestClose={() => setSelectedKpi(null)}>
          <View style={styles.modalBg}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <FontAwesome5 name="info-circle" size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedKpi}</Text>
              </View>
              
              <Text style={{ color: colors.secondary, fontWeight: 'bold', marginTop: 15, fontSize: 13 }}>EXPLICATION</Text>
              <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4, lineHeight: 20 }}>
                {kpiDefinitions[selectedKpi].desc}
              </Text>
              
              <Text style={{ color: colors.secondary, fontWeight: 'bold', marginTop: 20, fontSize: 13 }}>FORMULE DE CALCUL</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'monospace' }}>
                  {kpiDefinitions[selectedKpi].formula}
                </Text>
              </View>

              <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.primary }]} onPress={() => setSelectedKpi(null)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  appName: { fontSize: 20, fontWeight: "bold" },
  themeToggle: { padding: 8 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10, marginTop: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  alertCenter: { marginBottom: 20 },
  alertItem: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, borderLeftWidth: 4, marginBottom: 8 },
  resetBtn: { padding: 15, borderRadius: 8, marginTop: 30, borderWidth: 1, alignItems: "center" },
  resetText: { fontWeight: "bold" },
  testNotifyBtn: { padding: 15, borderRadius: 8, marginTop: 15, borderWidth: 1, alignItems: "center", flexDirection: 'row', justifyContent: 'center' },
  securityPanel: { marginTop: 10, padding: 20, borderRadius: 12, borderWidth: 1 },
  pinRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pinDisplay: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, width: 80, textAlign: 'center', fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalBox: { padding: 25, borderRadius: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 12 },
  modalCloseBtn: { marginTop: 30, padding: 15, borderRadius: 8, alignItems: 'center' }
});
