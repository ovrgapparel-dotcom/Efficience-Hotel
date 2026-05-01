import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import KPI from "../components/KPI";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";
import OnboardingModal from "../components/OnboardingModal";
import ReportDownloader from "../components/ReportDownloader";

const BANNER = require("../../assets/banners/banner_rh.png");

export default function HrScreen() {
  const { hrData, addHrRow, roomsData, restaurantData, removeDataRow } = useContext(DataContext);
  const { userRole } = useContext(AuthContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nom, setNom] = useState("");
  const [poste, setPoste] = useState("");
  const [shift, setShift] = useState("Jour"); // Jour, Nuit
  const [heures, setHeures] = useState("");
  const [taux, setTaux] = useState("");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!nom || !heures || !taux) return;
    const salaire = Number(heures) * Number(taux);
    addHrRow({
      id: Date.now().toString(),
      date, nom, poste, shift, heures: Number(heures), taux: Number(taux), salaire, remarques
    });
    setNom(""); setPoste(""); setHeures(""); setTaux(""); setShift("Jour");
  };

  const totalRevenuHotel = roomsData.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalRevenuResto = restaurantData.reduce((acc, r) => acc + (r.ventes || 0), 0);
  const CA_TOTAL = totalRevenuHotel + totalRevenuResto;

  const coutTotalMO = hrData.reduce((acc, r) => acc + r.salaire, 0);
  const heuresTotales = hrData.reduce((acc, r) => acc + r.heures, 0);

  const productivite = heuresTotales > 0 ? (CA_TOTAL / heuresTotales).toFixed(0) : 0;
  const ratioMasse = CA_TOTAL > 0 ? ((coutTotalMO / CA_TOTAL) * 100).toFixed(1) : 0;

  // New Metrics
  const totalCleaningMins = roomsData.reduce((acc, r) => acc + (r.cleaningTime || 0), 0);
  const totalPrepMins = restaurantData.reduce((acc, r) => acc + ((r.prepTime || 0) * (r.couverts || 1)), 0);
  const requiredOpHours = ((totalCleaningMins + totalPrepMins) / 60).toFixed(1);

  const isHrDeficient = heuresTotales < Number(requiredOpHours);

  const frontDeskData = hrData.filter(r => r.poste.toLowerCase().includes("réception") || r.poste.toLowerCase().includes("reception"));
  const hasDayShift = frontDeskData.some(r => r.shift === "Jour");
  const hasNightShift = frontDeskData.some(r => r.shift === "Nuit");
  const frontDeskCoverageOk = frontDeskData.length === 0 ? true : (hasDayShift && hasNightShift);

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>Pointage HR & Mouvement</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={{ padding: 5 }}>
          <FontAwesome5 name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_hr"
        title="Guide: HR & Rotation"
        steps={[
          "Shift Rotation: Le planning se divise désormais en shifts obligatoires (Jour / Nuit).",
          "Alerte de Couverture de Garde: Si la réception ou d'autres départements ne sont pas couverts pendant la Nuit, une alerte est déclenchée !",
          "Heures Prestées vs Hébergement: Les heures validées par les employés doivent couvrir l'estimation de temps validée dans les sélections du Restaurant et de l'Hôtel."
        ]}
      />

      <DepartmentBanner
        gradientColors={["#8B6800", "#F0A500"]}
        title="Ressources Humaines"
        subtitle="Pointage & Masse Salariale"
        icon={<FontAwesome5 name="users" size={26} color="#fff" />}
      />
      <View style={styles.kpiContainer}>
        <KPI title="Coût Total MO" value={`${coutTotalMO.toLocaleString()} CFA`} />
        <KPI title="Hs Totales" value={`${heuresTotales} H`} />
        <KPI title="Ratio MS" value={`${ratioMasse} %`} />
        <KPI title="Hs Nécessaires (H+R)" value={`${requiredOpHours} H`} />
      </View>
      
      {isHrDeficient && (
        <View style={styles.alertBox}>
          <FontAwesome5 name="exclamation-circle" size={20} color="#ff4444" />
          <Text style={styles.alertText}>Alerte: Rotation insuffisante! Les heures nécessaires dépassent le volume planifié.</Text>
        </View>
      )}

      {(!frontDeskCoverageOk && frontDeskData.length > 0) && (
        <View style={styles.alertBox}>
          <FontAwesome5 name="clock" size={20} color="#ffaa00" />
          <Text style={styles.alertText}>Alerte Réception: Couverture des shifts (Jour/Nuit) incomplète ou manquante.</Text>
        </View>
      )}

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Nouvelle Entrée</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Nom de l'employé" value={nom} onChangeText={setNom} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Poste (Réception, Ménage...)" value={poste} onChangeText={setPoste} />
        <Text style={{color: colors.text, marginBottom: 4, fontSize: 12}}>Type de Shift (Jour / Nuit)</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Shift (Jour / Nuit)" value={shift} onChangeText={setShift} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Heures travaillées" value={heures} onChangeText={setHeures} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Taux horaire (FCFA)" value={taux} onChangeText={setTaux} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        
        <View style={{ marginTop: 10 }}>
          <DynamicButton 
            title="Enregistrer Pointage" 
            onPress={handleAdd} 
            color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
          />
        </View>
      </View>

      <ReportDownloader
        title="Rapport Ressources Humaines"
        data={hrData}
        dateField="date"
        sectionColor="#F0A500"
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'nom', label: 'Employé' },
          { key: 'poste', label: 'Poste' },
          { key: 'shift', label: 'Shift' },
          { key: 'heures', label: 'Heures' },
          { key: 'taux', label: 'Taux' },
          { key: 'salaire', label: 'Salaire (FCFA)' },
        ]}
      />

      <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Historique Quotidien</Text>
      <ScrollView horizontal style={[styles.tableScroll, { backgroundColor: colors.card }]}>
        <View>
          <View style={[styles.tableHeader, { borderColor: colors.secondary }]}>
            <Text style={[styles.col, { color: colors.text }]}>Date</Text>
            <Text style={[styles.col, { color: colors.text }]}>Employé</Text>
            <Text style={[styles.col, { color: colors.text }]}>Poste</Text>
            <Text style={[styles.col, { color: colors.text }]}>Shift</Text>
            <Text style={[styles.col, { color: colors.text }]}>Heures</Text>
            <Text style={[styles.col, { color: colors.text }]}>Taux</Text>
            <Text style={[styles.col, { color: colors.text }]}>Salaire J.</Text>
            {userRole === 'MANAGER' && <Text style={[styles.col, { color: colors.text, width: 50 }]}>Action</Text>}
          </View>
          {hrData.map(row => (
            <View key={row.id} style={[styles.tableRow, { borderColor: colors.border }]}>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.date}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.nom}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.poste}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.shift}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.heures}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.taux}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.salaire}</Text>
              {userRole === 'MANAGER' && (
                <TouchableOpacity onPress={() => {
                  if(window.confirm("Supprimer ce pointage ?")) removeDataRow('hr', row.id);
                }} style={[styles.col, { width: 50, alignItems: 'center' }]}>
                  <FontAwesome5 name="trash" size={14} color="#e94560" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginVertical: 15 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  form: { padding: 15, borderRadius: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  tableScroll: { padding: 10, borderRadius: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 10 },
  col: { width: 90, textAlign: "center", fontSize: 12 },
  alertBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#3a1111", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ff4444" },
  alertText: { color: "#fff", marginLeft: 10, fontSize: 13, flex: 1 }
});
