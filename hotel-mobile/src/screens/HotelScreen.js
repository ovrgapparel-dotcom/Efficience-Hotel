import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import KPI from "../components/KPI";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";
import OnboardingModal from "../components/OnboardingModal";
import ReportDownloader from "../components/ReportDownloader";

const BANNER = require("../../assets/banners/banner_hebergement.png");

export default function HotelScreen() {
  const { roomsData, addRoomRow, addHousekeepingTask } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chambreNo, setChambreNo] = useState("");
  const [type, setType] = useState("");
  const [client, setClient] = useState("");
  const [statut, setStatut] = useState("Occupée");
  const [prixNuit, setPrixNuit] = useState("");
  const [nuits, setNuits] = useState("1");
  const [cleaningTime, setCleaningTime] = useState("30");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!chambreNo || !prixNuit) return;
    const total = Number(prixNuit) * Number(nuits);
    const cTime = Number(cleaningTime) || 30;

    addRoomRow({
      id: Date.now().toString(),
      date, chambreNo, type, client, statut, 
      prixNuit: Number(prixNuit), nuits: Number(nuits), total, 
      cleaningTime: cTime, remarques
    });

    addHousekeepingTask({
      id: Date.now().toString() + "_task",
      date,
      roomNo: chambreNo,
      roomType: type || 'Standard',
      clientName: client,
      nuits: Number(nuits),
      cleaningTime: cTime,
      completed: false
    });

    setChambreNo(""); setClient(""); setPrixNuit(""); setCleaningTime("30");
  };

  const totalRevenu = roomsData.reduce((acc, row) => acc + row.total, 0);
  const totalNuits = roomsData.reduce((acc, row) => acc + row.nuits, 0);
  const uniqueClients = new Set(roomsData.map(r => r.client).filter(c => c)).size;
  const dms = uniqueClients > 0 ? (totalNuits / uniqueClients).toFixed(1) : 0;
  
  const TOTAL_CHAMBRES = 40; 
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const tauxOcc = ((chambresOccupees / TOTAL_CHAMBRES) * 100).toFixed(1);
  const revpar = TOTAL_CHAMBRES > 0 ? (totalRevenu / TOTAL_CHAMBRES).toFixed(0) : 0;
  const totalCleaningMins = roomsData.reduce((acc, row) => acc + (row.cleaningTime || 0), 0);
  const totalCleaningHours = (totalCleaningMins / 60).toFixed(1);

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={[styles.title, { color: colors.text }]}>Gestion Hôtel</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={{ padding: 5 }}>
          <FontAwesome5 name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_hotel"
        title="Guide: Gestion Hôtel"
        steps={[
          "Enregistrement des Nuitées : Saisissez la chambre et son prix lors de l'enregistrement du client.",
          "Temps de Nettoyage : Estimez le temps de nettoyage ! L'application l'additionnera automatiquement comme charge de travail dans l'onglet RH (Ressources Humaines).",
          "Consommables : Chaque visite génère automatiquement l'utilisation d'1 unité de fournitures hôtelières dans le module Stock !"
        ]}
      />

      <DepartmentBanner
        image={BANNER}
        gradientColors={["#7A3200", "#C25A00"]}
        title="Hébergement"
        subtitle="Gestion des Chambres & Nuitées"
        icon={<FontAwesome5 name="bed" size={26} color="#fff" />}
      />
      <View style={styles.kpiContainer}>
        <KPI title="Tx Occup." value={`${tauxOcc}%`} />
        <KPI title="Revenu" value={`${totalRevenu.toLocaleString()} CFA`} />
        <KPI title="RevPAR" value={`${Number(revpar).toLocaleString()} CFA`} />
        <KPI title="DMS" value={`${dms} N`} />
        <KPI title="Ménage" value={`${totalCleaningHours} H`} />
      </View>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Nouvelle Entrée</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Chambre N°" value={chambreNo} onChangeText={setChambreNo} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Type (Standard, Suite...)" value={type} onChangeText={setType} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Nom du Client" value={client} onChangeText={setClient} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Statut" value={statut} onChangeText={setStatut} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Prix/Nuit (FCFA)" value={prixNuit} onChangeText={setPrixNuit} keyboardType="numeric" />
        <Text style={{color: colors.text, marginBottom: 4, fontSize: 12}}>Nuits</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Nuits" value={nuits} onChangeText={setNuits} keyboardType="numeric" />
        <Text style={{color: colors.text, marginBottom: 4, fontSize: 12}}>Temps Nettoyage (min/chambre)</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Temps Nettoyage (min/chambre)" value={cleaningTime} onChangeText={setCleaningTime} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        
        <View style={{ marginTop: 10 }}>
          <DynamicButton 
            title="Enregistrer la Nuitée" 
            onPress={handleAdd} 
            color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
          />
        </View>
      </View>

      <ReportDownloader
        title="Rapport Hébergement"
        data={roomsData}
        dateField="date"
        sectionColor="#C25A00"
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'chambreNo', label: 'Chambre' },
          { key: 'client', label: 'Client' },
          { key: 'statut', label: 'Statut' },
          { key: 'prixNuit', label: 'Prix/Nuit' },
          { key: 'nuits', label: 'Nuits' },
          { key: 'total', label: 'Total (FCFA)' },
        ]}
      />

      <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Historique Quotidien</Text>
      <ScrollView horizontal style={[styles.tableScroll, { backgroundColor: colors.card }]}>
        <View>
          <View style={[styles.tableHeader, { borderColor: colors.secondary }]}>
            <Text style={[styles.col, { color: colors.text }]}>Date</Text>
            <Text style={[styles.col, { color: colors.text }]}>Ch N°</Text>
            <Text style={[styles.col, { color: colors.text }]}>Client</Text>
            <Text style={[styles.col, { color: colors.text }]}>Statut</Text>
            <Text style={[styles.col, { color: colors.text }]}>Px/Nuit</Text>
            <Text style={[styles.col, { color: colors.text }]}>Nuits</Text>
            <Text style={[styles.col, { color: colors.text }]}>Total (FCFA)</Text>
          </View>
          {roomsData.map(row => (
            <View key={row.id} style={[styles.tableRow, { borderColor: colors.border }]}>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.date}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.chambreNo}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.client}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.statut}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.prixNuit}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.nuits}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.total}</Text>
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
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  kpiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  form: { padding: 15, borderRadius: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  tableScroll: { padding: 10, borderRadius: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 10 },
  col: { width: 100, textAlign: "center", fontSize: 12 }
});
