import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const { inventoryData, addInventoryRow } = useContext(DataContext);
  const { colors } = useContext(ThemeContext);

  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Fournitures');
  const [valeurInitiale, setValeurInitiale] = useState('');

  const submit = () => {
    if (!nom || !valeurInitiale) return;
    addInventoryRow({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      nom,
      categorie,
      valeurInitiale: parseFloat(valeurInitiale),
    });
    setNom('');
    setValeurInitiale('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Gestion des Stocks & Amortissements</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput 
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
          placeholder="Nom du bien (ex: Matelas, Serviettes, Frigo)" 
          placeholderTextColor={colors.textMuted}
          value={nom} onChangeText={setNom} 
        />
        <View style={styles.pickerRow}>
          {['Mobilier', 'Équipement', 'Fournitures'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.chip, categorie === cat && { backgroundColor: colors.primary }]}
              onPress={() => setCategorie(cat)}
            >
              <Text style={{ color: categorie === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput 
          style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
          placeholder="Valeur Initiale (CFA)" 
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={valeurInitiale} onChangeText={setValeurInitiale} 
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={submit}>
          <Text style={styles.buttonText}>Ajouter au Stock</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={inventoryData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemText, { color: colors.text }]}>{item.nom}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.categorie} • {item.date}</Text>
            </View>
            <Text style={[styles.itemValue, { color: colors.primary }]}>{item.valeurInitiale.toLocaleString()} CFA</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: { height: 45, borderBottomWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  pickerRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  button: { height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: '500' },
  itemValue: { fontSize: 16, fontWeight: 'bold' }
});
