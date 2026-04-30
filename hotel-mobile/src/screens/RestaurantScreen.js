import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { ThemeContext } from '../context/ThemeContext';
import KPI from '../components/KPI';
import OnboardingModal from '../components/OnboardingModal';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RestaurantScreen() {
  const { restaurantData, addRestaurantRow, addPOSSale } = useContext(DataContext);
  const { colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [saleCategory, setSaleCategory] = useState('Bar'); // Bar, Cocktails, Cuisine
  
  const CATALOG = {
    Bar: [
      { id: 'b1', nom: 'Bière', prix: 1200 },
      { id: 'v1', nom: 'Vin', prix: 10000 },
      { id: 'bt1', nom: 'Bouteille VIP', prix: 35000 }
    ],
    Cocktails: [
      { id: 'c1', nom: 'Cocktails', prix: 3500 }
    ],
    Cuisine: [
      { id: 'r1', nom: 'Repas Cuisine', prix: 4000 }
    ]
  };

  const [selectedProduct, setSelectedProduct] = useState(CATALOG.Bar[0]);
  const [quantite, setQuantite] = useState('1');

  const onCategoryChange = (cat) => {
    setSaleCategory(cat);
    setSelectedProduct(CATALOG[cat][0]);
  };

  const submit = () => {
    if (!quantite || parseInt(quantite) <= 0) return;
    const qte = parseInt(quantite);
    const totalRev = qte * selectedProduct.prix;

    // Save strictly to the restaurant/sales data
    addRestaurantRow({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      service: saleCategory,
      produit: selectedProduct.nom,
      quantite: qte,
      ventes: totalRev
    });

    // Deduct stock specifically
    addPOSSale(selectedProduct.nom, qte);
    setQuantite('1');
  };

  const totalVentes = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>Point of Sale - Bar & Cuisine</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={{ padding: 5 }}>
          <FontAwesome5 name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_resto"
        title="Guide: Point of Sale"
        steps={[
          "Enregistrement des Ventes: Filtrez par Bar, Cocktails ou Cuisine pour afficher vos articles.",
          "Deduction Automatique: Chaque produit (ex: Bière, Vin) vendu est immédiatement soutiré de votre registre d'Inventaire en temps réel.",
          "Revenus: Le chiffre financier de vos services gonflera le Chiffre d'Affaires global du Dashboard !"
        ]}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 15 }}>
        <KPI title="Revenu Total" value={`${totalVentes.toLocaleString()} FCFA`} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionHeader, { color: colors.secondary }]}>Enregistrer une Vente POS</Text>

        <View style={styles.pickerRow}>
          {['Bar', 'Cocktails', 'Cuisine'].map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, saleCategory === cat && { backgroundColor: colors.primary }]} onPress={() => onCategoryChange(cat)}>
              <Text style={{ color: saleCategory === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Sélectionner le Produit :</Text>
        <View style={styles.pickerRow}>
          {CATALOG[saleCategory].map(prod => (
            <TouchableOpacity key={prod.nom} style={[styles.chip, selectedProduct.nom === prod.nom && { backgroundColor: colors.secondary }]} onPress={() => setSelectedProduct(prod)}>
              <Text style={{ color: selectedProduct.nom === prod.nom ? '#fff' : colors.textMuted }}>{prod.nom}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Quantité :</Text>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Qté" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={quantite} onChangeText={setQuantite} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{color: colors.text}}>Total Estimé:</Text>
            <Text style={{color: colors.primary, fontSize: 18, fontWeight: 'bold'}}>{(parseInt(quantite||0) * selectedProduct.prix).toLocaleString()} FCFA</Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={submit}>
          <Text style={styles.buttonText}>Enregistrer la Vente</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurantData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemText, { color: colors.text }]}>{item.quantite}x {item.produit}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.service} • {item.date}</Text>
            </View>
            <Text style={[styles.itemValue, { color: colors.primary }]}>+ {item.ventes?.toLocaleString()} FCFA</Text>
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
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: { height: 45, borderBottomWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginBottom: 6 },
  button: { height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  itemText: { fontSize: 16, fontWeight: '500' },
  itemValue: { fontSize: 16, fontWeight: 'bold' }
});
