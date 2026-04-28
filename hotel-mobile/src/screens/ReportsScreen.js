import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import DynamicButton from '../components/DynamicButton';
import { FontAwesome5 } from '@expo/vector-icons';
import { generateHotelReport } from '../utils/reportGenerator';

export default function ReportsScreen() {
  const { roomsData, restaurantData, hrData, financeData } = useContext(DataContext);
  const { isDark, colors } = useContext(ThemeContext);

  const handleExportPDF = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const html = generateHotelReport({ roomsData, restaurantData, hrData, financeData, date: today });

      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        win.print();
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: \`Rapport Hôtelier \${today}\`, UTI: 'com.adobe.pdf' });
        } else {
          Alert.alert("PDF généré", \`Fichier sauvegardé à: \${uri}\`);
        }
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de générer le rapport PDF: " + err.message);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Moteur de Rapports Sécurisés</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Générez un résumé exécutif consolidé en un clic. Le document PDF inclut automatiquement vos KPIs mis à jour, les projections mensuelles, et les logs spécifiques à chaque département.
      </Text>

      <View style={styles.card}>
        <FontAwesome5 name="file-pdf" size={40} color="#1a6b3c" style={{ alignSelf: 'center', marginBottom: 20 }} />
        <DynamicButton
          title="Générer le Rapport PDF Exécutif"
          onPress={handleExportPDF}
          icon={<FontAwesome5 name="download" size={16} color="#fff" />}
          color={colors.primary}
          hoverColor={colors.primaryHover}
          isDark={isDark}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, marginBottom: 30, lineHeight: 22 },
  card: { padding: 30, borderRadius: 12, backgroundColor: 'rgba(26,107,60,0.05)', borderWidth: 1, borderColor: '#1a6b3c', marginTop: 20 }
});
