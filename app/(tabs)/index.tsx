import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TextInput,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

/* ================= THEME ================= */
const lightTheme = {
  background: "#f9f9f9",
  card: "#ffffff",
  textPrimary: "#000000",
  textSecondary: "#666666",
  border: "#eeeeee",
  header: "#ffffff",
  searchBg: "#f1f1f1",
};

const darkTheme = {
  background: "#0f0f0f",
  card: "#1c1c1c",
  textPrimary: "#ffffff",
  textSecondary: "#aaaaaa",
  border: "#2a2a2a",
  header: "#121212",
  searchBg: "#1f1f1f",
};

type Video = {
  _id: string;
  title: string;
  thumbnail: string;
  uploadedBy?: {
    _id?: string;
    username?: string;
    avatar?: string;
  };
};

export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");
  const theme = isDark ? darkTheme : lightTheme;

  /* ================= FETCH VIDEOS ================= */
  const fetchVideos = async () => {
    try {
      const res = await api.get("/videos");
      setVideos(res?.data?.data?.docs || []);
    } catch (err) {
      console.log("FETCH VIDEOS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* ================= PICK VIDEO ================= */
  const handlePickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const video = result.assets[0];

      router.push({
        pathname: "/upload",
        params: { videoUri: video.uri },
      });
    } catch (error) {
      console.log("VIDEO PICK ERROR:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ color: theme.textSecondary }}>Loading videos…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.header}
      />

      <View style={styles.container}>
        {/* ================= HEADER ================= */}
        <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.border }]}>
          <View style={styles.appLeft}>
            <View style={styles.logo} />
            {!showSearch && (
              <Text style={[styles.appName, { color: theme.textPrimary }]}>
                MyTube
              </Text>
            )}
          </View>

          {showSearch && (
            <View style={[styles.compactSearch, { backgroundColor: theme.searchBg }]}>
              <Ionicons name="search" size={16} color={theme.textSecondary} />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search"
                placeholderTextColor={theme.textSecondary}
                style={[styles.compactInput, { color: theme.textPrimary }]}
              />
            </View>
          )}

          <View style={styles.headerRight}>
            {!showSearch && (
              <Pressable onPress={() => setIsDark((prev) => !prev)}>
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={22}
                  color={theme.textPrimary}
                />
              </Pressable>
            )}

            <Pressable style={styles.iconBtn} onPress={() => setShowSearch((prev) => !prev)}>
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={22}
                color={theme.textPrimary}
              />
            </Pressable>

            {user && !showSearch && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/channel/[id]",
                    params: { id: user._id },
                  })
                }
              >
                <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ================= VIDEO LIST ================= */}
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Pressable onPress={() => router.push(`/video/${item._id}`)}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              </Pressable>

              <View style={styles.infoRow}>
                <View style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={[styles.title, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {item.uploadedBy?.username || "Unknown"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />

        {/* ================= FLOATING + BUTTON ================= */}
        <Pressable style={styles.fab} onPress={handlePickVideo}>
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

  appLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 28, height: 28, borderRadius: 6, backgroundColor: "#cc0000", marginRight: 8 },
  appName: { fontSize: 18, fontWeight: "700" },

  headerRight: { flexDirection: "row", alignItems: "center", marginLeft: "auto" },
  iconBtn: { marginLeft: 14 },

  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#777",
    marginLeft: 14,
  },

  compactSearch: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    marginHorizontal: 12,
    minWidth: 180,
    gap: 6,
  },

  compactInput: { flex: 1, fontSize: 14, padding: 0 },

  card: {
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
  },

  thumbnail: { width: "100%", height: 180 },
  infoRow: { flexDirection: "row", padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: "#777" },

  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { marginTop: 2, fontSize: 13 },

  fab: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: [{ translateX: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});