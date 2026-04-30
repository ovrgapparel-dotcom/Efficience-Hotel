import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const LOGO_OFFICIAL = require("../../assets/logo_eh_official.png");
const { width, height } = Dimensions.get("window");

// Floating icon config for animated background
const HOTEL_ICONS = [
  { name: "bed" },
  { name: "concierge-bell" },
  { name: "utensils" },
  { name: "cocktail" },
  { name: "swimming-pool" },
  { name: "spa" },
  { name: "broom" },
  { name: "wifi" },
  { name: "shuttle-van" },
  { name: "key" },
  { name: "luggage-cart" },
  { name: "star" },
];

const ROLE_OPTIONS = [
  { role: "MANAGER", label: "Administration", icon: "shield-alt", color: "#d4a373" },
  { role: "RECEPTION", label: "Service Réception", icon: "concierge-bell", color: "#64b5f6" },
  { role: "BARMAN", label: "Service Bar", icon: "cocktail", color: "#ef9a9a" },
  { role: "CLEANER", label: "Service Entretien", icon: "broom", color: "#a5d6a7" },
];

function FloatingIcon({ icon, delay, startX, startY }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.06)).current;

  useEffect(() => {
    const duration = 4000 + Math.random() * 3000;
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -40, duration, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.15, duration: duration / 2, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.04, duration: duration / 2, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute",
      left: startX,
      top: startY,
      opacity,
      transform: [{ translateY }],
    }}>
      <FontAwesome5 name={icon.name} size={28} color="#d4a373" />
    </Animated.View>
  );
}

export default function LoginScreen() {
  const { colors } = useContext(ThemeContext);
  const { verifyRolePin } = useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState(null);
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const pinPanelOpacity = useRef(new Animated.Value(0)).current;
  const pinPanelSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const selectRole = (role) => {
    setSelectedRole(role);
    setPin("");
    setIsError(false);
    // Animate PIN panel in
    pinPanelOpacity.setValue(0);
    pinPanelSlide.setValue(20);
    Animated.parallel([
      Animated.timing(pinPanelOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(pinPanelSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const goBack = () => {
    setSelectedRole(null);
    setPin("");
    setIsError(false);
  };

  const handlePinChange = async (value) => {
    const numericVal = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    setPin(numericVal);

    if (numericVal.length === 4) {
      const result = await verifyRolePin(selectedRole, numericVal);
      if (!result.success) {
        setIsError(true);
        setPin("");
        setTimeout(() => setIsError(false), 2000);
      }
    }
  };

  // Random positions for floating icons
  const floatingIcons = HOTEL_ICONS.map((icon, i) => ({
    icon,
    delay: i * 400,
    startX: (i % 4) * (width / 4) + Math.random() * 60,
    startY: Math.floor(i / 4) * (height / 3) + Math.random() * 100 + 50,
  }));

  const selectedRoleData = ROLE_OPTIONS.find(r => r.role === selectedRole);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      {floatingIcons.map((item, i) => (
        <FloatingIcon key={i} {...item} />
      ))}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>  
          <Image source={LOGO_OFFICIAL} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Text style={styles.title}>Intelligence Exécutive Hôtelière</Text>
        <View style={styles.divider} />

        {/* STEP 1: Role Selection */}
        {!selectedRole && (
          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }], alignItems: 'center', width: '100%' }}>
            <Text style={styles.stepLabel}>Sélectionnez votre niveau d'accès</Text>
            <View style={styles.rolesGrid}>
              {ROLE_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.role}
                  style={[styles.roleCard, { borderColor: item.color + '40' }]}
                  onPress={() => selectRole(item.role)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name={item.icon} size={28} color={item.color} />
                  <Text style={[styles.roleLabel, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* STEP 2: PIN Entry */}
        {selectedRole && (
          <Animated.View style={{ opacity: pinPanelOpacity, transform: [{ translateY: pinPanelSlide }], alignItems: 'center', width: '100%' }}>
            
            {/* Back button */}
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={14} color="#d4a373" />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

            {/* Selected role badge */}
            <View style={[styles.selectedBadge, { borderColor: selectedRoleData.color + '60' }]}>
              <FontAwesome5 name={selectedRoleData.icon} size={20} color={selectedRoleData.color} />
              <Text style={[styles.selectedLabel, { color: selectedRoleData.color }]}>{selectedRoleData.label}</Text>
            </View>

            <Text style={styles.pinPrompt}>Entrez le code d'accès</Text>

            {/* PIN Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[
                  styles.dot,
                  pin.length > i && [styles.dotFilled, { backgroundColor: selectedRoleData.color, borderColor: selectedRoleData.color }],
                  isError && styles.dotError,
                ]} />
              ))}
            </View>

            {/* Hidden input */}
            <TextInput
              style={styles.hiddenInput}
              value={pin}
              onChangeText={handlePinChange}
              maxLength={4}
              autoFocus
              caretHidden
            />

            {isError && <Text style={styles.errorText}>Code Incorrect</Text>}
            {!isError && pin.length > 0 && pin.length < 4 && (
              <Text style={styles.hintText}>Saisissez 4 caractères...</Text>
            )}
          </Animated.View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Accès Restreint au Personnel Autorisé</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 340,
    height: 240,
  },
  title: {
    fontSize: 18,
    fontWeight: "300",
    color: "#d4a373",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 15,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: "#d4a373",
    marginBottom: 30,
    borderRadius: 1,
  },
  stepLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    maxWidth: 500,
  },
  roleCard: {
    width: 140,
    paddingVertical: 22,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    gap: 10,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    padding: 8,
  },
  backText: {
    color: "#d4a373",
    fontSize: 13,
    fontWeight: "600",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    marginBottom: 25,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  pinPrompt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(212, 163, 115, 0.4)",
    backgroundColor: "transparent",
  },
  dotFilled: {
    backgroundColor: "#d4a373",
    borderColor: "#d4a373",
  },
  dotError: {
    borderColor: "#e94560",
    backgroundColor: "#e94560",
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    color: "#e94560",
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 14,
  },
  hintText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    letterSpacing: 1,
  },
});
