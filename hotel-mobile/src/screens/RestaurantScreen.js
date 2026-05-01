import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import KPI from '../components/KPI';
import OnboardingModal from '../components/OnboardingModal';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RestaurantScreen() {
  const { restaurantData, addRestoRow: addRestaurantRow, addPOSSale, removeDataRow, consumablesData } = useContext(DataContext);
  const { userRole } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [saleCategory, setSaleCategory] = useState('Bar');
  
  // Transform consumables data into dynamic catalog (ignore anything categorized as 'Nettoyage')
  const DYNAMIC_CATALOG = consumablesData.reduce((acc, item) => {
    if (item.categorie === 'Nettoyage') return acc;
    const cat = item.categorie === 'Alimentaire' ? 'Cuisine' : item.categorie;
    if (!acc[cat]) acc[cat] = [];
    // Ensure we don't duplicate names in the catalog list for the picker
    if (!acc[cat].find(c => c.nom === item.nom)) {
       acc[cat].push({ nom: item.nom, prix: item.prix || 0 });
    }
    return acc;
  }, {});

  // Fallback defaults if inventory holds nothing mapping to pos yet
  if (!DYNAMIC_CATALOG['Bar']) DYNAMIC_CATALOG['Bar'] = [{ nom: 'Vide', prix: 0 }];
  if (!DYNAMIC_CATALOG['Cuisine']) DYNAMIC_CATALOG['Cuisine'] = [{ nom: 'Vide', prix: 0 }];

  const availableCategories = Object.keys(DYNAMIC_CATALOG).sort();

  const [selectedProduct, setSelectedProduct] = useState(DYNAMIC_CATALOG['Bar'][0]);
  const [quantite, setQuantite] = useState('1');
  const [isCustom, setIsCustom] = useState(false);
  const [customNom, setCustomNom] = useState('');
  const [customPrix, setCustomPrix] = useState('');

  const onCategoryChange = (cat) => {
    setSaleCategory(cat);
    setSelectedProduct(DYNAMIC_CATALOG[cat] ? DYNAMIC_CATALOG[cat][0] : null);
    setIsCustom(false);
  };

  const submit = () => {
    if (!quantite || parseInt(quantite) <= 0) return;
    const qte = parseInt(quantite);
    
    let prodNom = '';
    let prodPrix = 0;
    
    if (isCustom) {
      if (!customNom || !customPrix) return;
      prodNom = customNom;
      prodPrix = parseInt(customPrix);
    } else {
      prodNom = selectedProduct.nom;
      prodPrix = selectedProduct.prix;
    }
    
    const totalRev = qte * prodPrix;

    // Save strictly to the restaurant/sales data
    addRestaurantRow({
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      service: saleCategory,
      produit: prodNom,
      quantite: qte,
      ventes: totalRev
    });

    // Deduct stock specifically
    addPOSSale(prodNom, qte);
    setQuantite('1');
    setCustomNom('');
    setCustomPrix('');
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

        <View style={styles.catTabs}>
          {availableCategories.map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, saleCategory === cat && { backgroundColor: colors.primary }]} onPress={() => onCategoryChange(cat)}>
              <Text style={{ color: saleCategory === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Sélectionner le Produit :</Text>
        <View style={styles.pickerRow}>
          {DYNAMIC_CATALOG[saleCategory]?.map(prod => (
            <TouchableOpacity key={prod.nom} style={[styles.chip, !isCustom && selectedProduct?.nom === prod.nom && { backgroundColor: colors.secondary }]} onPress={() => { setSelectedProduct(prod); setIsCustom(false); }}>
              <Text style={{ color: !isCustom && selectedProduct?.nom === prod.nom ? '#fff' : colors.textMuted }}>{prod.nom}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.chip, isCustom && { backgroundColor: colors.secondary }]} onPress={() => setIsCustom(true)}>
            <Text style={{ color: isCustom ? '#fff' : colors.textMuted }}>+ Produit Personnalisé</Text>
          </TouchableOpacity>
        </View>

        {isCustom && (
          <View style={{marginBottom: 10}}>
            <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Nom du Produit:</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Produit Personnel..." placeholderTextColor={colors.textMuted} value={customNom} onChangeText={setCustomNom} />
            <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Prix Unitaire (FCFA):</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Prix" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={customPrix} onChangeText={setCustomPrix} />
          </View>
        )}

        <Text style={{color: colors.text, marginBottom: 4, fontSize: 13}}>Quantité :</Text>
        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Qté" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={quantite} onChangeText={setQuantite} />
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{color: colors.text}}>Total Estimé:</Text>
            <Text style={{color: colors.primary, fontSize: 18, fontWeight: 'bold'}}>
              {(parseInt(quantite||0) * (isCustom ? parseInt(customPrix||0) : (selectedProduct?.prix || 0))).toLocaleString()} FCFA
            </Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.itemValue, { color: colors.primary, marginRight: userRole === 'MANAGER' ? 15 : 0 }]}>+ {item.ventes?.toLocaleString()} FCFA</Text>
              {userRole === 'MANAGER' && (
                <TouchableOpacity onPress={() => {
                  if(window.confirm("Supprimer cette vente POS ?")) removeDataRow('restaurant', item.id);
                }}>
                  <FontAwesome5 name="trash" size={14} color="#e94560" />
                </TouchableOpacity>
              )}
            </View>
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
