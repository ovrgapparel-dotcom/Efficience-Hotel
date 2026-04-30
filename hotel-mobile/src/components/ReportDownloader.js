import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const RANGES = [
  { key: 'day', label: 'Jour' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

function filterByRange(data, range, dateField = 'date') {
  if (range === 'all') return data;
  const now = new Date();
  const cutoff = new Date();
  if (range === 'day') cutoff.setDate(now.getDate() - 1);
  else if (range === 'week') cutoff.setDate(now.getDate() - 7);
  else if (range === 'month') cutoff.setMonth(now.getMonth() - 1);

  return data.filter(item => {
    try {
      const d = new Date(item[dateField]);
      return d >= cutoff;
    } catch { return true; }
  });
}

export default function ReportDownloader({ title, data, columns, dateField, sectionColor }) {
  const { colors } = useContext(ThemeContext);
  const [selectedRange, setSelectedRange] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const accent = sectionColor || colors.primary;

  const handleDownload = async () => {
    const filtered = filterByRange(data, selectedRange, dateField || 'date');
    if (filtered.length === 0) {
      return Alert.alert("Aucune Donnée", "Aucun enregistrement trouvé pour cette période.");
    }

    const rangeLabel = RANGES.find(r => r.key === selectedRange)?.label || 'Tout';
    const now = new Date().toLocaleDateString('fr-FR');

    const headerCells = columns.map(c => `<th style="padding:8px;border:1px solid #555;background:#2a2a2a;color:#d4a373;font-size:11px;">${c.label}</th>`).join('');
    const rows = filtered.map(item => {
      const cells = columns.map(c => {
        let val = item[c.key];
        if (val === undefined || val === null) val = '-';
        if (typeof val === 'number') val = val.toLocaleString('fr-FR');
        return `<td style="padding:6px 8px;border:1px solid #444;color:#ccc;font-size:11px;">${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    // Summary stats
    const numericCols = columns.filter(c => typeof filtered[0]?.[c.key] === 'number');
    let summaryRow = '';
    if (numericCols.length > 0) {
      summaryRow = '<tr>' + columns.map(c => {
        if (typeof filtered[0]?.[c.key] === 'number') {
          const total = filtered.reduce((acc, item) => acc + (item[c.key] || 0), 0);
          return `<td style="padding:6px 8px;border:1px solid #555;background:#1a1a1a;color:#d4a373;font-weight:bold;font-size:11px;">TOTAL: ${total.toLocaleString('fr-FR')}</td>`;
        }
        return `<td style="padding:6px 8px;border:1px solid #555;background:#1a1a1a;"></td>`;
      }).join('') + '</tr>';
    }

    const html = `
    <html>
    <head><meta charset="utf-8"><style>
      @page { margin: 30px; }
      body { font-family: 'Helvetica', sans-serif; background: #121212; color: #e0e0e0; padding: 20px; }
      h1 { color: #d4a373; font-size: 22px; border-bottom: 2px solid #d4a373; padding-bottom: 8px; }
      .meta { color: #999; font-size: 12px; margin-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .footer { margin-top: 30px; color: #666; font-size: 10px; text-align: center; border-top: 1px solid #333; padding-top: 10px; }
    </style></head>
    <body>
      <h1>📊 ${title}</h1>
      <p class="meta">Période: <strong>${rangeLabel}</strong> • Généré le: ${now} • ${filtered.length} enregistrement(s)</p>
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}${summaryRow}</tbody>
      </table>
      <div class="footer">Efficience Hotel ERP v2.0 — Rapport généré automatiquement par le système d'intelligence opérationnelle.</div>
    </body>
    </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.warn("Report generation error", e);
      Alert.alert("Erreur", "Impossible de générer le rapport.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome5 name="file-download" size={16} color={accent} />
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }}>Télécharger Rapport</Text>
        </View>
        <FontAwesome5 name={expanded ? "chevron-up" : "chevron-down"} size={12} color={colors.textMuted} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 8 }}>Sélectionner la période :</Text>
          <View style={styles.rangeRow}>
            {RANGES.map(r => (
              <TouchableOpacity
                key={r.key}
                onPress={() => setSelectedRange(r.key)}
                style={[
                  styles.rangeChip,
                  { borderColor: accent },
                  selectedRange === r.key && { backgroundColor: accent }
                ]}
              >
                <Text style={{ color: selectedRange === r.key ? '#fff' : accent, fontSize: 12, fontWeight: 'bold' }}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleDownload} style={[styles.downloadBtn, { backgroundColor: accent }]}>
            <FontAwesome5 name="file-pdf" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Générer PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rangeChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  downloadBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8 },
});
