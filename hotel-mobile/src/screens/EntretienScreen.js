import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import DepartmentBanner from '../components/DepartmentBanner';
import KPI from '../components/KPI';

export default function EntretienScreen() {
  const { housekeepingData, validateHousekeepingTask, consumablesData, roomsData } = useContext(DataContext);
  const { colors } = useContext(ThemeContext);

  const pendingTasks = housekeepingData.filter(t => !t.completed);
  const completedTasks = housekeepingData.filter(t => t.completed);

  // KPI calculations
  const totalCleaningMins = housekeepingData.reduce((a, t) => a + (t.cleaningTime || 0), 0);
  const totalCleaningHours = (totalCleaningMins / 60).toFixed(1);
  const totalSuppliesUsed = housekeepingData.reduce((a, t) => a + (t.suppliesUsed || 0), 0);
  const cleaningSupply = consumablesData.find(c => c.categorie === 'Nettoyage');
  const supplyRemaining = cleaningSupply ? (cleaningSupply.qte - (cleaningSupply.sold || 0)) : 0;
  const avgCleanPerRoom = housekeepingData.length > 0 ? (totalCleaningMins / housekeepingData.length).toFixed(0) : 0;

  // Group tasks by date for calendar view
  const tasksByDate = {};
  housekeepingData.forEach(t => {
    if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
    tasksByDate[t.date].push(t);
  });
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DepartmentBanner title="Service Entretien" subtitle="Calendrier de Nettoyage & Fournitures" />

      {/* KPI Row */}
      <View style={styles.kpiRow}>
        <KPI title="En Attente" value={pendingTasks.length} />
        <KPI title="Complétées" value={completedTasks.length} />
        <KPI title="Heures Tot." value={`${totalCleaningHours}h`} />
        <KPI title="Moy/Chambre" value={`${avgCleanPerRoom}m`} />
      </View>

      {/* Supply Allocation Panel */}
      <View style={[styles.supplyPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.supplyHeader}>
          <FontAwesome5 name="pump-soap" size={18} color={colors.primary} />
          <Text style={[styles.supplyTitle, { color: colors.text }]}>Allocation Fournitures</Text>
        </View>
        <View style={styles.supplyRow}>
          <View style={styles.supplyItem}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Consommées</Text>
            <Text style={{ color: '#e94560', fontWeight: 'bold', fontSize: 18 }}>{totalSuppliesUsed}</Text>
          </View>
          <View style={styles.supplyItem}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Restantes</Text>
            <Text style={{ color: supplyRemaining < 10 ? '#e94560' : '#28a745', fontWeight: 'bold', fontSize: 18 }}>{supplyRemaining}</Text>
          </View>
          <View style={styles.supplyItem}>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Prévision J+7</Text>
            <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
              {Math.max(0, supplyRemaining - Math.ceil(pendingTasks.length * 1.2))}
            </Text>
          </View>
        </View>
        {supplyRemaining < 10 && (
          <View style={styles.alertBanner}>
            <FontAwesome5 name="exclamation-triangle" size={12} color="#fff" />
            <Text style={styles.alertText}>Stock Nettoyage Critique — Commander immédiatement</Text>
          </View>
        )}
      </View>

      {/* Active Tasks */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Tâches en Attente 🧹 ({pendingTasks.length})
      </Text>
      {pendingTasks.map(t => (
        <View key={t.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Chambre {t.roomNo}</Text>
              {t.roomType && <Text style={[styles.typeBadge, { color: colors.primary }]}>{t.roomType}</Text>}
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Check-in: {t.date} {t.checkoutDate ? `→ Check-out: ${t.checkoutDate}` : ''}
            </Text>
            {t.clientName && <Text style={{ color: colors.textMuted, fontSize: 11 }}>Client: {t.clientName}</Text>}
            <View style={{ flexDirection: 'row', gap: 15, marginTop: 6 }}>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>⏱ {t.cleaningTime} min</Text>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>🧴 {t.suppliesUsed || 1} unité(s)</Text>
              {t.nuits && <Text style={{ color: colors.secondary, fontSize: 12 }}>🌙 {t.nuits} nuit(s)</Text>}
            </View>
          </View>
          <TouchableOpacity onPress={() => validateHousekeepingTask(t.id)} style={[styles.checkBtn, { backgroundColor: '#28a745' }]}>
            <FontAwesome5 name="check" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      {pendingTasks.length === 0 && (
        <Text style={{ color: colors.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
          Aucune chambre en attente de nettoyage !
        </Text>
      )}

      {/* Calendar View */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
        📅 Calendrier de Rotation
      </Text>
      {sortedDates.slice(0, 7).map(date => {
        const tasks = tasksByDate[date];
        const done = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        return (
          <View key={date} style={[styles.calendarRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>{date}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {total} chambre(s) • {done}/{total} nettoyée(s)
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${total > 0 ? (done / total) * 100 : 0}%` }]} />
            </View>
          </View>
        );
      })}

      {/* Completed History */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Historique ✅</Text>
      {completedTasks.slice(0, 10).map(t => (
        <View key={t.id} style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Chambre {t.roomNo} — Nettoyée</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t.date} • {t.cleaningTime}min • {t.suppliesUsed || 1} fourniture(s)</Text>
          </View>
          <FontAwesome5 name="check-circle" size={20} color="#28a745" />
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  checkBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  typeBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(212,163,115,0.15)' },
  supplyPanel: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  supplyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  supplyTitle: { fontSize: 15, fontWeight: 'bold' },
  supplyRow: { flexDirection: 'row', justifyContent: 'space-around' },
  supplyItem: { alignItems: 'center' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e94560', padding: 10, borderRadius: 8, marginTop: 12 },
  alertText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  calendarRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  progressBar: { width: 80, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#28a745', borderRadius: 4 },
});
