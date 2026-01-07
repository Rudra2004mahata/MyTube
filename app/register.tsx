import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { api } from "../services/api";

/* ================= THEME ================= */
const lightTheme = {
  background: "#ffffff",
  text: "#000000",
  subText: "#666666",
  inputBg: "#f2f2f2",
};

const darkTheme = {
  background: "#0f0f0f",
  text: "#ffffff",
  subText: "#aaaaaa",
  inputBg: "#1c1c1c",
};

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/register", {
        fullName,
        username,
        email,
        password,
      });

      Alert.alert("Success 🎉", "Account created. Please login.");
      router.replace("/login");

    } catch (error: any) {
      console.log("REGISTER ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Register failed",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Register</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={theme.subText}
        value={fullName}
        onChangeText={setFullName}
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
      />

      <TextInput
        placeholder="Username"
        placeholderTextColor={theme.subText}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.subText}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.subText}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
      />

      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Creating..." : "Create Account"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/login")}>
        <Text style={[styles.link, { color: theme.text }]}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ff0000",
    padding: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
  },
});