import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

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
    color: "#000",
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
    <View style={styles.footer}>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Brand line */}
      <Text style={styles.brand}>Efficience Hotel</Text>
      <Text style={styles.powered}>
        Powered by{" "}
        <Text
          style={styles.link}
          onPress={() => open("https://www.imibusinesssolutions.com")}
        >
          www.imibusinesssolutions.com
        </Text>
      </Text>

      {/* Contact */}
      <View style={styles.contactRow}>
        <FontAwesome5 name="phone-alt" size={11} color="#aaa" />
        <Text style={styles.contactText}>  +225 07 99 10 81 08</Text>
      </View>
      <View style={styles.contactRow}>
        <FontAwesome5 name="envelope" size={11} color="#aaa" />
        <Text
          style={[styles.contactText, styles.link]}
          onPress={() => open("mailto:imi.socialmediaimage@gmail.com")}
        >
          {"  "}imi.socialmediaimage@gmail.com
        </Text>
      </View>

      {/* Social media icons */}
      <View style={styles.socialRow}>
        {SOCIAL.map((s) => (
          <TouchableOpacity
            key={s.name}
            onPress={() => open(s.url)}
            style={[styles.socialBtn, { borderColor: s.color }]}
          >
            {s.lib === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons name={s.name} size={16} color={s.color} />
            ) : (
              <FontAwesome5 name={s.name} size={16} color={s.color} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} IMI Business Solutions. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#0d0d0d",
  },
  divider: {
    width: "100%",
    height: 2,
    backgroundColor: "#1a6b3c",
    marginBottom: 20,
    borderRadius: 1,
  },
  brand: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  powered: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 12,
  },
  link: {
    color: "#4caf50",
    textDecorationLine: "underline",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactText: {
    fontSize: 12,
    color: "#aaa",
  },
  socialRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 12,
    gap: 12,
  },
  socialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  copyright: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
    marginTop: 4,
  },
});
