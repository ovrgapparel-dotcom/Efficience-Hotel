import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import API from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    // Basic validation
    if (!email || !password) {
       return Alert.alert("Error", "Please enter your email and password");
    }
    try {
      const res = await API.post("/auth/login", { email, password });
      API.defaults.headers.common["Authorization"] = res.data.token;
      navigation.replace("Main"); // Redirect to the main layout
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data || "Something went wrong");
    }
  };

  const register = async () => {
    if (!email || !password) {
        return Alert.alert("Error", "Please enter an email and password to register");
     }
    try {
      const res = await API.post("/auth/register", { email, password });
      Alert.alert("Success", "Account created! You can now log in.");
    } catch (error) {
        Alert.alert("Registration Failed", error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Efficience Hotel</Text>
      <Text style={styles.subtitle}>Sign in to manage your KPIs</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        onChangeText={setPassword} 
      />
      
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={register}>
        <Text style={[styles.buttonText, styles.registerText]}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f7f9fc",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a2e",
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
