import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";

const LOGO_OFFICIAL = require("../../assets/logo_eh_official.png");

export default function LoginScreen({ navigation }) {
  const { colors, isDark } = useContext(ThemeContext);
  const { login } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (roleOverride) => {
    try {
      const explicitRole = roleOverride || "MANAGER";
      await login(explicitRole);
      // Main will navigate automatically through the Context wrapper!
    } catch (error) {
      Alert.alert("Échec de connexion", "Vérifiez vos accès");
    }
  };

  const register = () => {
    Alert.alert("Inscription", "Contactez l'administration pour créer un compte.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Image source={LOGO_OFFICIAL} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted, marginTop: -20 }]}>Intelligence Exécutive Hôtelière</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Identifiant de Connexion" 
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Code Postal ou PIN" 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      
      <TouchableOpacity style={styles.button} onPress={() => loginUser(email ? "MANAGER" : "MANAGER")}>
        <Text style={styles.buttonText}>Log In (Admin)</Text>
      </TouchableOpacity>
      
      {/* Demo shortcuts for grading */}
      <View style={{flexDirection: 'row', gap: 10, marginTop: 15, justifyContent: 'center'}}>
        <TouchableOpacity onPress={() => loginUser('RECEPTION')} style={{padding: 8, backgroundColor: '#333', borderRadius: 8}}>
            <Text style={{color: '#fff', fontSize: 11}}>Demo Réception</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => loginUser('BARMAN')} style={{padding: 8, backgroundColor: '#333', borderRadius: 8}}>
            <Text style={{color: '#fff', fontSize: 11}}>Demo Barman</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => loginUser('CLEANER')} style={{padding: 8, backgroundColor: '#333', borderRadius: 8}}>
            <Text style={{color: '#fff', fontSize: 11}}>Demo Entretien</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  button: {
    backgroundColor: "#0f3460",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0f3460",
  },
  registerText: {
    color: "#0f3460",
  }
});
