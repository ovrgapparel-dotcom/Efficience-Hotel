import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const LOGO_OFFICIAL = require("../../assets/logo_eh_official.png");
const { width, height } = Dimensions.get("window");

// Floating icon config for animated background
const HOTEL_ICONS = [
  { name: "bed", label: "Chambres" },
  { name: "concierge-bell", label: "Réception" },
  { name: "utensils", label: "Restaurant" },
  { name: "cocktail", label: "Bar" },
  { name: "swimming-pool", label: "Piscine" },
  { name: "spa", label: "Spa" },
  { name: "broom", label: "Entretien" },
  { name: "wifi", label: "WiFi" },
  { name: "shuttle-van", label: "Navette" },
  { name: "key", label: "Clés" },
  { name: "luggage-cart", label: "Bagages" },
  { name: "star", label: "5 Étoiles" },
];

function FloatingIcon({ icon, delay, startX, startY }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    const duration = 4000 + Math.random() * 3000;
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -40, duration, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.18, duration: duration / 2, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.06, duration: duration / 2, useNativeDriver: true }),
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
  const { loginWithPin } = useContext(AuthContext);

  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Animated values for entrance
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Core fix: pass the full value directly to avoid stale state
  const handlePinChange = async (value) => {
    // Only allow numeric
    const numericVal = value.replace(/[^0-9]/g, '');
    setPin(numericVal);
    
    if (numericVal.length === 4) {
      const result = await loginWithPin(numericVal);
      if (!result.success) {
        setIsError(true);
        setStatusMsg("Code Incorrect — Réessayez");
        setPin("");
        setTimeout(() => {
          setIsError(false);
          setStatusMsg("");
        }, 2000);
      }
    }
  };

  // Generate random positions for floating icons
  const floatingIcons = HOTEL_ICONS.map((icon, i) => ({
    icon,
    delay: i * 400,
    startX: (i % 4) * (width / 4) + Math.random() * 60,
    startY: Math.floor(i / 4) * (height / 3) + Math.random() * 100 + 50,
  }));

  return (
    <View style={[styles.container, { backgroundColor: '#0a0a0f' }]}>
      {/* Animated Background Icons */}
      {floatingIcons.map((item, i) => (
        <FloatingIcon key={i} {...item} />
      ))}

      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image source={LOGO_OFFICIAL} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        
        <Text style={styles.title}>Intelligence Exécutive Hôtelière</Text>
        <View style={styles.divider} />

        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }], alignItems: 'center', width: '100%' }}>
          <Text style={styles.prompt}>Entrez votre Code d'Accès</Text>

          {/* PIN Display Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[
                styles.dot,
                pin.length > i && styles.dotFilled,
                isError && styles.dotError,
              ]} />
            ))}
          </View>

          {/* Hidden input for keyboard */}
          <TextInput
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            caretHidden
          />

          {/* Status */}
          {isError && (
            <Text style={styles.errorText}>{statusMsg}</Text>
          )}
          {!isError && pin.length > 0 && pin.length < 4 && (
            <Text style={styles.hintText}>Saisissez 4 chiffres...</Text>
          )}

          {/* Hint Codes (for demo) */}
          <View style={styles.hintsContainer}>
            <Text style={styles.hintsTitle}>Accès Restreint au Personnel Autorisé</Text>
            <View style={styles.hintsRow}>
              <View style={styles.hintBadge}>
                <FontAwesome5 name="shield-alt" size={10} color="#d4a373" />
                <Text style={styles.hintCode}>Admin: 1111</Text>
              </View>
              <View style={styles.hintBadge}>
                <FontAwesome5 name="concierge-bell" size={10} color="#d4a373" />
                <Text style={styles.hintCode}>Récep: 2222</Text>
              </View>
              <View style={styles.hintBadge}>
                <FontAwesome5 name="cocktail" size={10} color="#d4a373" />
                <Text style={styles.hintCode}>Bar: 3333</Text>
              </View>
              <View style={styles.hintBadge}>
                <FontAwesome5 name="broom" size={10} color="#d4a373" />
                <Text style={styles.hintCode}>Clean: 4444</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 35,
    borderRadius: 1,
  },
  prompt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 25,
    letterSpacing: 1,
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
    borderColor: "rgba(212, 163, 115, 0.5)",
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
    fontStyle: 'italic',
  },
  hintsContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  hintsTitle: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    marginBottom: 12,
    letterSpacing: 1,
  },
  hintsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(212, 163, 115, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(212, 163, 115, 0.15)",
  },
  hintCode: {
    color: "rgba(212, 163, 115, 0.6)",
    fontSize: 10,
    fontWeight: "bold",
  },
});
