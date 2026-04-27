import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import KPI from "../components/KPI";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";

const BANNER = require("../../assets/banners/banner_rh.png");

export default function HrScreen() {
  const { hrData, addHrRow, roomsData, restaurantData } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nom, setNom] = useState("");
  const [poste, setPoste] = useState("");
  const [heures, setHeures] = useState("");
  const [taux, setTaux] = useState("");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!nom || !heures || !taux) return;
    const salaire = Number(heures) * Number(taux);
    addHrRow({
      id: Date.now().toString(),
      date, nom, poste, heures: Number(heures), taux: Number(taux), salaire, remarques
    });
    setNom(""); setPoste(""); setHeures(""); setTaux("");
  };

  const totalRevenuHotel = roomsData.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalRevenuResto = restaurantData.reduce((acc, r) => acc + (r.ventes || 0), 0);
  const CA_TOTAL = totalRevenuHotel + totalRevenuResto;

  const coutTotalMO = hrData.reduce((acc, r) => acc + r.salaire, 0);
  const heuresTotales = hrData.reduce((acc, r) => acc + r.heures, 0);

  const productivite = heuresTotales > 0 ? (CA_TOTAL / heuresTotales).toFixed(0) : 0;
  const ratioMasse = CA_TOTAL > 0 ? ((coutTotalMO / CA_TOTAL) * 100).toFixed(1) : 0;

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DepartmentBanner
        image={BANNER}
        title="Ressources Humaines"
        subtitle="Pointage & Masse Salariale"
        icon={<FontAwesome5 name="users" size={26} color="#fff" />}
      />
      <View style={styles.kpiContainer}>
        <KPI title="Coût Total MO" value={`${coutTotalMO.toLocaleString()} CFA`} />
        <KPI title="Heures Totales" value={`${heuresTotales} H`} />
        <KPI title="Productivité" value={`${Number(productivite).toLocaleString()} CFA/H`} />
        <KPI title="Ratio MS" value={`${ratioMasse} %`} />
      </View>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Nouvelle Entrée</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Nom de l'employé" value={nom} onChangeText={setNom} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Poste (Réception, Ménage...)" value={poste} onChangeText={setPoste} />
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

      <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Historique Quotidien</Text>
      <ScrollView horizontal style={[styles.tableScroll, { backgroundColor: colors.card }]}>
        <View>
          <View style={[styles.tableHeader, { borderColor: colors.secondary }]}>
            <Text style={[styles.col, { color: colors.text }]}>Date</Text>
            <Text style={[styles.col, { color: colors.text }]}>Employé</Text>
            <Text style={[styles.col, { color: colors.text }]}>Poste</Text>
            <Text style={[styles.col, { color: colors.text }]}>Heures</Text>
            <Text style={[styles.col, { color: colors.text }]}>Taux</Text>
            <Text style={[styles.col, { color: colors.text }]}>Salaire J.</Text>
          </View>
          {hrData.map(row => (
            <View key={row.id} style={[styles.tableRow, { borderColor: colors.border }]}>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.date}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.nom}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.poste}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.heures}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.taux}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.salaire}</Text>
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
  col: { width: 100, textAlign: "center", fontSize: 12 }
});
