import React, { useRef, useState } from 'react';
import { Animated, Pressable, Text, StyleSheet } from 'react-native';

export default function DynamicButton({ title, onPress, icon, color = "#0f3460", hoverColor = "#1f64b0", width = "100%", isDark }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{ width }}
    >
      <Animated.View style={[
        styles.btn,
        { 
          backgroundColor: isHovered ? hoverColor : color,
          transform: [{ scale: scaleAnim }],
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent',
        }
      ]}>
        {icon}
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5
  }
});
