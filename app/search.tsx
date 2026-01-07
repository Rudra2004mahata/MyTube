import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <TextInput
          placeholder="Search videos"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          placeholderTextColor="#888"
        />
      </View>

      {/* ===== EMPTY STATE ===== */}
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Search for videos
        </Text>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },

  back: {
    color: "#fff",
    fontSize: 22,
    marginRight: 12,
  },

  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1c1c1c",
    color: "#fff",
    fontSize: 15,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#aaa",
    fontSize: 15,
  },
});