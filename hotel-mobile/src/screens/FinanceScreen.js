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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ReportDownloader from '../components/ReportDownloader';

const BANNER = require("../../assets/banners/banner_finance.png");

export default function FinanceScreen() {
  const { financeData, addFinanceRow, roomsData = [], restaurantData = [], removeDataRow } = useContext(DataContext);
  const { userRole } = useContext(AuthContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("Coût"); 
  const [depart, setDepart] = useState("Général");
  const [desc, setDesc] = useState("");
  const [montant, setMontant] = useState("");
  const [paiement, setPaiement] = useState("Virement");

  const handleAdd = () => {
    if (!montant || !desc) return;
    addFinanceRow({
      id: Date.now().toString(),
      date, type, departement: depart, description: desc, montant: Number(montant), paiement
    });
    setDesc(""); setMontant("");
  };

  const totalRevenus = financeData.filter(d => d.type === "Revenu").reduce((acc, r) => acc + r.montant, 0);
  const totalCouts = financeData.filter(d => d.type === "Coût").reduce((acc, r) => acc + r.montant, 0);
  const ebitdaJournalier = totalRevenus - totalCouts;

  const exportToCSV = async () => {
    let csv = "Date,Departement,Type,Montant(FCFA)\\n";
    roomsData.forEach(r => { csv += `${r.date},Hebergement,Revenu,${r.total}\\n` });
    restaurantData.forEach(r => { csv += `${r.date},Restaurant,Revenu,${r.montant}\\n` });
    financeData.forEach(r => { csv += `${r.date},${r.departement},${r.type},${r.montant}\\n` });

    try {
      const uri = FileSystem.documentDirectory + "Bilan_Financier_Efficience.csv";
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri);
    } catch(e) {
      console.warn("CSV Error", e);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <DepartmentBanner
          gradientColors={["#1A0A00", "#5A2800"]}
          title="Finance & Trésorerie"
          subtitle="Comptabilité & Flux de Fonds"
          icon={<FontAwesome5 name="chart-line" size={26} color="#F0A500" />}
        />
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={{ padding: 10 }}>
          <FontAwesome5 name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_finance"
        title="Guide: Finance"
        steps={[
          "Saisie Manuelle: Ajoutez toute dépense externe ou encaissement annexe à votre chiffre d'affaires ici.",
          "Net Profit: Ces dépenses opérationnelles réduiront directement le 'Profit Net' calculé sur votre Dashboard.",
          "Note: Les coûts des d'actifs amortis au niveau de l'Inventaire ne sont plus listés ici pour éviter les doubles comptages."
        ]}
      />

      <View style={styles.kpiContainer}>
        <KPI title="Revenus Extra" value={`${totalRevenus.toLocaleString()} CFA`} />
        <KPI title="Coûts Divers" value={`${totalCouts.toLocaleString()} CFA`} />
        <KPI title="EBITDA Dept" value={`${ebitdaJournalier.toLocaleString()} CFA`} />
      </View>

      <ReportDownloader
        title="Rapport Finance & Trésorerie"
        data={financeData}
        dateField="date"
        sectionColor="#F0A500"
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'departement', label: 'Département' },
          { key: 'description', label: 'Description' },
          { key: 'montant', label: 'Montant (FCFA)' },
          { key: 'paiement', label: 'Paiement' },
        ]}
      />

      <TouchableOpacity onPress={exportToCSV} style={{backgroundColor: '#28a745', padding: 12, borderRadius: 8, marginHorizontal: 0, marginBottom: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
         <FontAwesome5 name="file-csv" size={18} color="#fff" style={{marginRight: 8}}/>
         <Text style={{color: '#fff', fontWeight: 'bold'}}>Exporter Bilan Comptable (CSV)</Text>
      </TouchableOpacity>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Saisie Comptable</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Type (Revenu / Coût)" value={type} onChangeText={setType} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Département / Poste" value={depart} onChangeText={setDepart} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Description" value={desc} onChangeText={setDesc} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Montant (FCFA)" value={montant} onChangeText={setMontant} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Mode de paiement" value={paiement} onChangeText={setPaiement} />
        
        <View style={{ marginTop: 10 }}>
          <DynamicButton 
            title="Enregistrer Transaction" 
            onPress={handleAdd} 
            color={colors.primary} hoverColor={colors.primaryHover} isDark={isDark}
          />
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Registre Quotidien</Text>
      <ScrollView horizontal style={[styles.tableScroll, { backgroundColor: colors.card }]}>
        <View>
          <View style={[styles.tableHeader, { borderColor: colors.secondary }]}>
            <Text style={[styles.col, { color: colors.text }]}>Date</Text>
            <Text style={[styles.col, { color: colors.text }]}>Type</Text>
            <Text style={[styles.col, { color: colors.text }]}>Poste</Text>
            <Text style={[styles.col, { color: colors.text }]}>Description</Text>
            <Text style={[styles.col, { color: colors.text }]}>Montant</Text>
            <Text style={[styles.col, { color: colors.text }]}>Paiement</Text>
            {userRole === 'MANAGER' && <Text style={[styles.col, { color: colors.text, width: 50 }]}>Action</Text>}
          </View>
          {financeData.map(row => (
            <View key={row.id} style={[styles.tableRow, { borderColor: colors.border }]}>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.date}</Text>
              <Text style={[styles.col, {color: row.type === 'Revenu' ? 'green' : 'red'}]}>{row.type}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.departement}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.description}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.montant}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.paiement}</Text>
              {userRole === 'MANAGER' && (
                <TouchableOpacity onPress={() => {
                  if(window.confirm("Supprimer cette transaction ?")) removeDataRow('finance', row.id);
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
  col: { width: 90, textAlign: "center", fontSize: 12 }
});
