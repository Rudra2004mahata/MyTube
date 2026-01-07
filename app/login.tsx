import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { api } from "../services/api";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/users/login", {
        email,
        password,
      });

      const accessToken = response.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("No access token received");
      }

      // ✅ store token
      await login(accessToken);

      // ✅ MANUAL NAVIGATION (THIS WAS MISSING)
      router.replace("/(tabs)");

    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data || error.message);
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "white",
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#999" : "#ff0000",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/register")}>
        <Text style={{ marginTop: 16, textAlign: "center" }}>
          New user? Register
        </Text>
      </Pressable>
    </View>
  );
}