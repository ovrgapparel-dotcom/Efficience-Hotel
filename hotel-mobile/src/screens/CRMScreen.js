import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';
import DepartmentBanner from '../components/DepartmentBanner';

export default function CRMScreen() {
  const { clientsData, addClientRow } = useContext(DataContext);
  const { colors } = useContext(ThemeContext);
  
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [preferences, setPreferences] = useState('');

  const submit = () => {
    if (!nom) return;
    addClientRow({ id: Date.now().toString(), nom, telephone, preferences, visits: 1, lastVisit: new Date().toLocaleDateString('fr-FR') });
    setNom(''); setTelephone(''); setPreferences('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <DepartmentBanner title="Relation Client (CRM)" subtitle="Préférences & Fidélité" />
      
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Nom du Client" placeholderTextColor={colors.textMuted} value={nom} onChangeText={setNom} />
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Téléphone / Email" placeholderTextColor={colors.textMuted} value={telephone} onChangeText={setTelephone} />
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Préférences (Ex: État de santé, Chambre vue mer...)" placeholderTextColor={colors.textMuted} value={preferences} onChangeText={setPreferences} />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={submit}>
            <Text style={styles.buttonText}>Sauvegarder Client</Text>
        </TouchableOpacity>
      </View>

      <Text style={{color: colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 10}}>Base de Données Clients</Text>
      {clientsData.map(client => (
          <View key={client.id} style={[styles.row, {borderColor: colors.border}]}>
             <View style={{flex: 1}}>
                 <Text style={{color: colors.text, fontWeight: 'bold'}}>{client.nom}</Text>
                 <Text style={{color: colors.textMuted, fontSize: 12}}>📞 {client.telephone}</Text>
                 <Text style={{color: colors.secondary, fontSize: 12, marginTop: 4}}>{client.preferences}</Text>
             </View>
             <View style={{alignItems: 'flex-end'}}>
                 <Text style={{color: colors.text}}>Visites: {client.visits}</Text>
                 <Text style={{color: colors.textMuted, fontSize: 10}}>{client.lastVisit}</Text>
             </View>
          </View>
      ))}
      <View style={{height: 40}}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: { height: 45, borderBottomWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 }
});
