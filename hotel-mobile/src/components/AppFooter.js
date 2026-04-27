import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LOGO = require("../../assets/logo_eh_official.png");

const SOCIAL = [
  {
    name: "facebook-f",
    url: "https://www.facebook.com/howtowithvirgile/",
    color: "#1877F2",
    lib: "FontAwesome5",
  },
  {
    name: "twitter-x",
    url: "https://x.com/Virgile_IMI",
    color: "#ffffff",
    lib: "MaterialCommunityIcons",
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/in/virgile-obeo-952a24235/",
    color: "#0A66C2",
    lib: "FontAwesome5",
  },
  {
    name: "youtube",
    url: "https://www.youtube.com/@IMIBUSINESSSOLUTIONS",
    color: "#FF0000",
    lib: "FontAwesome5",
  },
];

export default function AppFooter() {
  const open = (url) => Linking.openURL(url).catch(() => {});

  return (
    <View style={styles.footerWrap}>
      {/* Glowing Divider */}
      <LinearGradient
        colors={["transparent", "#1a6b3c", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />

      <View style={styles.footerContent}>
        {/* Brand & Logo Section */}
        <View style={styles.brandSection}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.powered}>
            Powered by{" "}
            <Text style={styles.link} onPress={() => open("https://www.imibusinesssolutions.com")}>
              IMI Business Solutions
            </Text>
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.contactSection}>
          <TouchableOpacity onPress={() => open("tel:+2250799108108")} style={styles.contactBadge}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="phone-alt" size={12} color="#1a6b3c" />
            </View>
            <Text style={styles.contactText}>+225 07 99 10 81 08</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => open("mailto:imi.socialmediaimage@gmail.com")} style={styles.contactBadge}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="envelope" size={12} color="#1a6b3c" />
            </View>
            <Text style={styles.contactText}>imi.socialmediaimage@gmail.com</Text>
          </TouchableOpacity>
        </View>

        {/* Social media icons */}
        <View style={styles.socialRow}>
          {SOCIAL.map((s) => (
            <TouchableOpacity
              key={s.name}
              onPress={() => open(s.url)}
              style={[styles.socialBtn, { borderColor: s.color === "#ffffff" ? "#333" : s.color }]}
            >
              {s.lib === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons name={s.name} size={18} color={s.color} />
              ) : (
                <FontAwesome5 name={s.name} size={18} color={s.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} IMI Business Solutions. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    backgroundColor: "#080808",
    width: "100%",
  },
  divider: {
    width: "100%",
    height: 1.5,
    opacity: 0.8,
  },
  footerContent: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  powered: {
    fontSize: 13,
    color: "#888",
    letterSpacing: 0.5,
  },
  link: {
    color: "#28a745",
    fontWeight: "bold",
  },
  contactSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginBottom: 26,
  },
  contactBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#222",
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(26, 107, 60, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  contactText: {
    fontSize: 13,
    color: "#ccc",
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 16,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    borderWidth: 1.5,
  },
  copyright: {
    fontSize: 11,
    color: "#444",
    letterSpacing: 0.5,
  },
});
