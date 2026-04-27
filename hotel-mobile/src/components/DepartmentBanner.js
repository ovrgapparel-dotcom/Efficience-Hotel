import React, { useContext } from "react";
import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

/**
 * DepartmentBanner
 * Props:
 *  - image: require(…) image source
 *  - title: main department heading string
 *  - subtitle: optional smaller line under the title
 *  - icon: optional JSX element placed left of the title
 */
export default function DepartmentBanner({ image, title, subtitle, icon }) {
  const { isDark } = useContext(ThemeContext);

  return (
    <ImageBackground
      source={image}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      {/* dark overlay so text reads clearly on any photo */}
      <View style={[styles.overlay, { backgroundColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(15,52,96,0.72)" }]}>
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    height: 160,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImage: {
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    marginRight: 12,
    opacity: 0.95,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.80)",
    marginTop: 2,
  },
});
