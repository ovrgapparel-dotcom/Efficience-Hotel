import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import OnboardingModal from '../components/OnboardingModal';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import ReportDownloader from '../components/ReportDownloader';

export default function InventoryScreen() {
  const { 
    inventoryData, addInventoryRow, 
    consumablesData, addConsumableRow, removeDataRow
  } = useContext(DataContext);
  const { userRole } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [helpVisible, setHelpVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Consommables');

  // Actifs State
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('Fournitures');
  const [valeurInitiale, setValeurInitiale] = useState('');

  // Consumables State
  const [consNom, setConsNom] = useState('');
  const [consCategory, setConsCategory] = useState('Bar');
  const [consQte, setConsQte] = useState('');

  const submitActif = () => {
    if (!nom || !valeurInitiale) return;
    addInventoryRow({ id: Date.now().toString(), date: new Date().toLocaleDateString('fr-FR'), nom, categorie, valeurInitiale: parseFloat(valeurInitiale) });
    setNom(''); setValeurInitiale('');
  };

  const submitConsumable = () => {
    if (!consNom || !consQte) return;
    addConsumableRow({ id: Date.now().toString(), date: new Date().toLocaleDateString('fr-FR'), nom: consNom, categorie: consCategory, qte: parseInt(consQte, 10), sold: 0 });
    setConsNom(''); setConsQte('');
  };

  const generatePurchaseOrder = async () => {
    const lowStockItems = consumablesData.filter(item => (item.qte > 0 && ((item.qte - (item.sold || 0)) / item.qte) < 0.2));
    if (lowStockItems.length === 0) return Alert.alert("Aucun Besoin", "Tous vos stocks sont stables.");

    const html = `<html><head><style>body { font-family: 'Helvetica'; padding: 20px; } h1 { color: #0f3460; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; }</style></head><body><h1>Bon de Commande Fournisseur</h1><p>Date: ${new Date().toLocaleDateString('fr-FR')}</p><hr/><table><tr><th>Produit</th><th>Catégorie</th><th>Stock Actuel</th><th>Qté Réassort (Suggérée)</th></tr>${lowStockItems.map(item => `<tr><td>${item.nom}</td><td>${item.categorie}</td><td>${item.qte - (item.sold || 0)}</td><td>${item.qte - (item.qte - (item.sold || 0))}</td></tr>`).join('')}</table><p style="margin-top: 40px">Généré par Efficience ERP.</p></body></html>`;
    
    try {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
    } catch (e) {
        console.warn("PDF generation error", e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={[styles.title, { color: colors.text }]}>Inventaire & POS</Text>
        <TouchableOpacity onPress={() => setHelpVisible(true)} style={{ padding: 5 }}>
          <FontAwesome5 name="question-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <OnboardingModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)}
        storageKey="@onboard_inventory"
        title="Guide: Stock & Actifs"
        steps={[
          "Séparation: Naviguez entre vos Actifs Amortis (Meubles) et vos Consommables de Bar.",
          "Règle des 20%: Des alertes 'Stock Bas' apparaîtront ici pour signaler au staff si l'unitarité restante d'un produit passe sous les 20%.",
          "Deduction Auto: Ce registre se draine automatiquement suite à chaque vente en point de vente ou occupation de chambre (Fournitures) !"
        ]}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'Consommables' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]} onPress={() => setActiveTab('Consommables')}>
          <Text style={{ color: activeTab === 'Consommables' ? colors.primary : colors.textMuted, fontWeight: 'bold' }}>Bar & Consommables</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Actifs' && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]} onPress={() => setActiveTab('Actifs')}>
          <Text style={{ color: activeTab === 'Actifs' ? colors.primary : colors.textMuted, fontWeight: 'bold' }}>Amortissements</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Actifs' ? (
        <>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Nom du bien (ex: Matelas, Serviettes)" placeholderTextColor={colors.textMuted} value={nom} onChangeText={setNom} />
            <View style={styles.pickerRow}>
              {['Mobilier', 'Équipement', 'Fournitures'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, categorie === cat && { backgroundColor: colors.primary }]} onPress={() => setCategorie(cat)}>
                  <Text style={{ color: categorie === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Valeur Initiale (CFA)" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={valeurInitiale} onChangeText={setValeurInitiale} />
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={submitActif}>
              <Text style={styles.buttonText}>Ajouter au Stock (Immobilisation)</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={inventoryData} keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemText, { color: colors.text }]}>{item.nom}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.categorie} • {item.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.itemValue, { color: colors.primary, marginRight: userRole === 'MANAGER' ? 15 : 0 }]}>{item.valeurInitiale?.toLocaleString()} CFA</Text>
                  {userRole === 'MANAGER' && (
                    <TouchableOpacity onPress={() => {
                      if(window.confirm("Supprimer cet actif ?")) removeDataRow('inventory', item.id);
                    }}>
                      <FontAwesome5 name="trash" size={14} color="#e94560" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        </>
      ) : (
        <ScrollView>
          <View style={styles.alertBox}>
             <FontAwesome5 name="info-circle" size={16} color="#856404" />
             <Text style={[styles.alertText, {color: '#856404', marginLeft: 8}]}>Les articles en stock bas ({"<"} 20%) sont signalés à l'équipe.</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{color: colors.text, marginBottom: 10, fontSize: 16, fontWeight: 'bold'}}>Mise à Jour du Stock (Entrée)</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Article Existant ou Nouveau" placeholderTextColor={colors.textMuted} value={consNom} onChangeText={setConsNom} />
            <View style={styles.pickerRow}>
              {['Bar', 'Alimentaire', 'Nettoyage'].map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, consCategory === cat && { backgroundColor: colors.primary }]} onPress={() => setConsCategory(cat)}>
                  <Text style={{ color: consCategory === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Quantité à Ajouter" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={consQte} onChangeText={setConsQte} />
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.secondary }]} onPress={submitConsumable}>
              <Text style={styles.buttonText}>Restocker</Text>
            </TouchableOpacity>
          </View>

          <ReportDownloader
            title="Rapport Inventaire & Consommables"
            data={consumablesData}
            dateField="date"
            sectionColor="#e74c3c"
            columns={[
              { key: 'nom', label: 'Article' },
              { key: 'categorie', label: 'Catégorie' },
              { key: 'qte', label: 'Stock Initial' },
              { key: 'sold', label: 'Vendus/Utilisés' },
            ]}
          />

          <TouchableOpacity onPress={generatePurchaseOrder} style={{backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, marginBottom: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
             <FontAwesome5 name="file-pdf" size={18} color="#fff" style={{marginRight: 8}}/>
             <Text style={{color: '#fff', fontWeight: 'bold'}}>Générer Bon de Commande (PDF)</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border}}>
             <Text style={{flex: 2, color: colors.primary, fontWeight: 'bold', fontSize: 12}}>Article</Text>
             <Text style={{flex: 1, color: colors.primary, fontWeight: 'bold', fontSize: 12, textAlign: 'center'}}>Initial</Text>
             <Text style={{flex: 1, color: colors.primary, fontWeight: 'bold', fontSize: 12, textAlign: 'center'}}>Vendus</Text>
             <Text style={{flex: 1, color: colors.primary, fontWeight: 'bold', fontSize: 12, textAlign: 'center'}}>Restant</Text>
          </View>

          {consumablesData.map(item => {
            const sold = item.sold || 0;
            const remaining = item.qte - sold;
            const isLow = remaining < (item.qte * 0.20); 

            return (
              <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.itemText, { color: colors.text, fontSize: 14 }]}>{item.nom}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{item.categorie}</Text>
                  {isLow && <Text style={{ color: '#dc3545', fontSize: 10, fontWeight: 'bold' }}>⚠️ Stock Bas</Text>}
                </View>
                <Text style={[{flex: 1, textAlign: 'center', color: colors.text}]}>{item.qte}</Text>
                <Text style={[{flex: 1, textAlign: 'center', color: colors.text}]}>{sold}</Text>
                <Text style={[{flex: 1, textAlign: 'center', fontWeight: 'bold'}, isLow ? {color: '#dc3545'} : {color: '#28a745'} ]}>{remaining}</Text>
                {userRole === 'MANAGER' && (
                  <TouchableOpacity onPress={() => {
                    if(window.confirm("Supprimer ce consommable ?")) removeDataRow('consumables', item.id);
                  }} style={{ marginLeft: 10 }}>
                    <FontAwesome5 name="trash" size={14} color="#e94560" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          <View style={{height: 50}} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, paddingBottom: 10, alignItems: 'center' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  input: { height: 45, borderBottomWidth: 1, marginBottom: 12, paddingHorizontal: 8 },
  pickerRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  button: { height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  itemRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, alignItems: 'center' },
  itemText: { fontWeight: '500' },
  itemValue: { fontSize: 16, fontWeight: 'bold' },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ffeaa7' },
  alertText: { fontSize: 13 }
});
