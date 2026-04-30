import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { DataContext } from "../context/DataContext";
import { ThemeContext } from "../context/ThemeContext";
import KPI from "../components/KPI";
import DynamicButton from "../components/DynamicButton";
import DepartmentBanner from "../components/DepartmentBanner";

const BANNER = require("../../assets/banners/banner_restaurant.png");

export default function RestaurantScreen() {
  const { restaurantData, addRestoRow } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [service, setService] = useState("Déjeuner");
  const [couverts, setCouverts] = useState("");
  const [ventes, setVentes] = useState("");
  const [coutMatiere, setCoutMatiere] = useState("");
  const [prepTime, setPrepTime] = useState("15");
  const [remarques, setRemarques] = useState("");

  const handleAdd = () => {
    if (!ventes || !couverts) return;
    const foodCostPerc = ((Number(coutMatiere) / Number(ventes)) * 100).toFixed(1);
    addRestoRow({
      id: Date.now().toString(),
      date, service, couverts: Number(couverts),
      ventes: Number(ventes), coutMatiere: Number(coutMatiere), foodCostPerc,
      prepTime: Number(prepTime), remarques
    });
    setCouverts(""); setVentes(""); setCoutMatiere(""); setPrepTime("15");
  };

  const totalVentes = restaurantData.reduce((acc, row) => acc + row.ventes, 0);
  const totalCouverts = restaurantData.reduce((acc, row) => acc + row.couverts, 0);
  const totalCout = restaurantData.reduce((acc, row) => acc + row.coutMatiere, 0);
  
  const avgFoodCost = totalVentes > 0 ? ((totalCout / totalVentes) * 100).toFixed(1) : 0;
  const ticketMoyen = totalCouverts > 0 ? (totalVentes / totalCouverts).toFixed(0) : 0;
  const margeBrute = totalVentes > 0 ? (((totalVentes - totalCout) / totalVentes) * 100).toFixed(1) : 0;

  const totalPrepMins = restaurantData.reduce((acc, row) => acc + ((row.prepTime || 0) * (row.couverts || 1)), 0);
  const totalPrepHours = (totalPrepMins / 60).toFixed(1);

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.inputText, borderColor: colors.border }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DepartmentBanner
        gradientColors={["#004D2C", "#006B3F"]}
        title="Restaurant"
        subtitle="Suivi F&B – Couverts & Ventes"
        icon={<MaterialIcons name="restaurant" size={26} color="#fff" />}
      />
      <View style={styles.kpiContainer}>
        <KPI title="CA Total" value={`${totalVentes.toLocaleString()} CFA`} />
        <KPI title="Food Cost" value={`${avgFoodCost} %`} />
        <KPI title="Ticket Moy." value={`${Number(ticketMoyen).toLocaleString()} CFA`} />
        <KPI title="Marge Brute" value={`${margeBrute} %`} />
        <KPI title="Tps Prod." value={`${totalPrepHours} H`} />
      </View>

      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Nouvelle Entrée</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Service (Déj./Dîner)" value={service} onChangeText={setService} />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Nombre de couverts" value={couverts} onChangeText={setCouverts} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Ventes (FCFA)" value={ventes} onChangeText={setVentes} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Coût matières (FCFA)" value={coutMatiere} onChangeText={setCoutMatiere} keyboardType="numeric" />
        <Text style={{color: colors.text, marginBottom: 4, fontSize: 12}}>Temps préparation (min/couvert)</Text>
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Temps prép. (min/couvert)" value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" />
        <TextInput style={inputStyle} placeholderTextColor={colors.textMuted} placeholder="Remarques" value={remarques} onChangeText={setRemarques} />
        
        <View style={{ marginTop: 10 }}>
          <DynamicButton 
            title="Enregistrer le Service" 
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
            <Text style={[styles.col, { color: colors.text }]}>Service</Text>
            <Text style={[styles.col, { color: colors.text }]}>Couverts</Text>
            <Text style={[styles.col, { color: colors.text }]}>Ventes</Text>
            <Text style={[styles.col, { color: colors.text }]}>Coûts M.</Text>
            <Text style={[styles.col, { color: colors.text }]}>FC %</Text>
          </View>
          {restaurantData.map(row => (
            <View key={row.id} style={[styles.tableRow, { borderColor: colors.border }]}>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.date}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.service}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.couverts}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.ventes}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.coutMatiere}</Text>
              <Text style={[styles.col, { color: colors.textMuted }]}>{row.foodCostPerc}%</Text>
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
