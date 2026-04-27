import React, { useContext } from "react";
import { View, Text, ImageBackground, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../context/ThemeContext";

const LOGO_MINIMAL = require("../../assets/logo_eh_minimal.png");

/**
 * DepartmentBanner
 * Props:
 *  - image: optional require(…) image source. If omitted, renders an Afro-gradient background.
 *  - gradientColors: array of 2+ hex strings for the gradient when no image is used.
 *  - title: main heading
 *  - subtitle: optional smaller line
 *  - icon: optional JSX element
 *  - pattern: if true, renders a decorative kente-inspired strip at the bottom
 */
export default function DepartmentBanner({ image, gradientColors, title, subtitle, icon, pattern = true }) {
  const { isDark } = useContext(ThemeContext);

  // Overlay always darkens the photo/gradient for text legibility
  const overlayColor = isDark ? "rgba(0,0,0,0.55)" : "rgba(20,10,0,0.52)";

  const content = (
    <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
      <View style={styles.brandingHeader}>
         <Image source={LOGO_MINIMAL} style={styles.bannerLogo} resizeMode="contain" />
      </View>
      {pattern && (
        <View style={styles.kenteStrip}>
          {['#C25A00','#F0A500','#006B3F','#FFFFFF','#006B3F','#F0A500','#C25A00'].map((c, i) => (
            <View key={i} style={[styles.kenteBlock, { backgroundColor: c }]} />
          ))}
        </View>
      )}
      <View style={styles.row}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );

  if (image) {
    return (
      <ImageBackground source={image} style={styles.banner} imageStyle={styles.bannerImage}>
        {content}
      </ImageBackground>
    );
  }

  // No photo → Ivory Coast inspired gradient background
  const grad = gradientColors || ["#C25A00", "#7A3200"];
  return (
    <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    height: 160,
    marginBottom: 20,
    borderRadius: 14,
    overflow: "hidden",
  },
  bannerImage: { resizeMode: "cover" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  brandingHeader: {
    position: "absolute",
    top: 10,
    right: 15,
    width: 60,
    height: 60,
  },
  bannerLogo: {
    width: "100%",
    height: "100%",
  },
  kenteStrip: {
    flexDirection: "row",
    height: 6,
    width: "100%",
    marginBottom: 12,
  },
  kenteBlock: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  iconWrap: { marginRight: 12, opacity: 0.95 },
  textWrap: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginTop: 2,
  },
});
