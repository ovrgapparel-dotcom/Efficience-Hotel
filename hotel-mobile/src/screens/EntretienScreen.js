import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import DepartmentBanner from '../components/DepartmentBanner';

export default function EntretienScreen() {
  const { housekeepingData, validateHousekeepingTask } = useContext(DataContext);
  const { colors } = useContext(ThemeContext);

  const pendingTasks = housekeepingData.filter(t => !t.completed);
  const completedTasks = housekeepingData.filter(t => t.completed);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DepartmentBanner title="Housekeeping (Entretien)" subtitle="Missions de Nettoyage" />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tâches en Attente 🧹 ({pendingTasks.length})</Text>
      {pendingTasks.map(t => (
        <View key={t.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{flex: 1}}>
            <Text style={{color: colors.text, fontWeight: 'bold', fontSize: 16}}>Chambre: {t.roomNo}</Text>
            <Text style={{color: colors.textMuted, fontSize: 12}}>Déclencheur: Check-in Hôtel ({t.date})</Text>
            <Text style={{color: colors.secondary, fontSize: 13, marginTop: 4}}>Temps alloué: {t.cleaningTime} min</Text>
          </View>
          <TouchableOpacity onPress={() => validateHousekeepingTask(t.id)} style={[styles.checkBtn, { backgroundColor: '#28a745' }]}>
            <FontAwesome5 name="check" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}

      {pendingTasks.length === 0 && <Text style={{color: colors.textMuted, fontStyle: 'italic', marginBottom: 20}}>Aucune chambre en attente de nettoyage !</Text>}

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Historique des Validations ✅</Text>
      {completedTasks.slice(0, 10).map(t => (
        <View key={t.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}>
          <Text style={{color: colors.text, fontWeight: 'bold'}}>Chambre {t.roomNo} - Nettoyée</Text>
        </View>
      ))}
      <View style={{height: 40}}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  checkBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});
