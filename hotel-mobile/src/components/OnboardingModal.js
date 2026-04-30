import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OnboardingModal({ visible, onClose, storageKey, title, steps }) {
  const { colors } = useContext(ThemeContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    checkSeen();
  }, [visible]);

  const checkSeen = async () => {
    // If explicitly opened via Help button
    if (visible) {
      setShow(true);
      return;
    }
    // Auto-show on first visit
    try {
      const hasSeen = await AsyncStorage.getItem(storageKey);
      if (!hasSeen) {
        setShow(true);
        await AsyncStorage.setItem(storageKey, 'true');
      }
    } catch (e) {
      console.warn("Storage error with Onboarding", e);
    }
  };

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  return (
    <Modal visible={show} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.primary }]}>💡 {title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <FontAwesome5 name="times-circle" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <FontAwesome5 name="check-circle" size={16} color={colors.secondary} style={{marginTop: 3}} />
                <Text style={{ flex: 1, marginLeft: 10, color: colors.text, fontSize: 15, lineHeight: 22 }}>
                  {step}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleClose}>
            <Text style={styles.buttonText}>Compris, fermer</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    maxHeight: '75%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1
  },
  content: {
    marginBottom: 20
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
