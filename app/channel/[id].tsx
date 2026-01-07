import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  useColorScheme,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

/* ================= THEME ================= */
const themes = {
  light: {
    background: "#f5f5f5",
    card: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#666666",
    border: "#e5e5e5",
    primary: "#cc0000",
    muted: "#777777",
    danger: "#d32f2f",
  },
  dark: {
    background: "#0f0f0f",
    card: "#1c1c1c",
    textPrimary: "#ffffff",
    textSecondary: "#aaaaaa",
    border: "#2a2a2a",
    primary: "#ff3b3b",
    muted: "#888888",
    danger: "#ff5252",
  },
};

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, logout } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? themes.dark : themes.light;

  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);

  const isMyProfile = user?._id === id;

  /* ================= DATA ================= */
  const fetchChannel = async () => {
    try {
      const res = await api.get(`/users/channel/${id}`);

      const channelData = res?.data?.data; // 🔒 SAFE

      setChannel(channelData);
      setSubscribersCount(
        channelData?.subscribersCount ??
        channelData?.subscribers?.length ??
        0
      );
    } catch (err) {
      console.log("FETCH CHANNEL ERROR:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchChannelVideos = async () => {
    try {
      const res = await api.get(`/videos?userId=${id}`);
      setVideos(res?.data?.data?.docs || []);
    } finally {
      setLoadingVideos(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      if (!user || !id || isMyProfile) return;
      const res = await api.get(`/subscriptions/check/${id}`);
      setSubscribed(res?.data?.data?.subscribed);
      setSubscribersCount(
        res?.data?.data?.subscribersCount ?? subscribersCount
      );
    } catch {}
  };

  const handleToggleSubscribe = async () => {
    try {
      if (!user || isMyProfile) return;
      setLoadingSubscribe(true);
      const res = await api.patch(`/subscriptions/toggle/${id}`);
      setSubscribed(res?.data?.data?.subscribed);
      setSubscribersCount(
        res?.data?.data?.subscribersCount ?? subscribersCount
      );
      fetchChannel();
    } finally {
      setLoadingSubscribe(false);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  useEffect(() => {
    if (!id) return;
    fetchChannel();
    fetchChannelVideos();
    checkSubscriptionStatus();
  }, [id]);

  if (loadingProfile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      style={{ backgroundColor: theme.background }}
      ListHeaderComponent={
        <>
          {/* ===== COVER ===== */}
          <Image
            source={{
              uri:
                channel?.coverImage ||
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
            }}
            style={styles.banner}
          />

          {/* ===== PROFILE CARD ===== */}
          <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
            <Image
              source={{
                uri:
                  channel?.avatar ||
                  "https://i.pravatar.cc/150",
              }}
              style={styles.avatar}
            />

            <Text style={[styles.username, { color: theme.textPrimary }]}>
              {channel?.username || "Unknown"}
            </Text>

            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {subscribersCount} subscribers
            </Text>

            {!isMyProfile && (
              <Pressable
                style={[
                  styles.subscribeBtn,
                  { backgroundColor: subscribed ? theme.muted : theme.primary },
                ]}
                onPress={handleToggleSubscribe}
                disabled={loadingSubscribe}
              >
                <Text style={styles.subscribeText}>
                  {loadingSubscribe
                    ? "Please wait..."
                    : subscribed
                    ? "Subscribed"
                    : "Subscribe"}
                </Text>
              </Pressable>
            )}

            {isMyProfile && (
              <>
                <Text style={styles.myProfileTag}>
                  This is your profile
                </Text>

                <Pressable
                  style={[
                    styles.logoutBtn,
                    { borderColor: theme.danger },
                  ]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.logoutText, { color: theme.danger }]}>
                    Logout
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {/* ===== VIDEOS ===== */}
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.textPrimary },
            ]}
          >
            Videos
          </Text>

          {loadingVideos && <ActivityIndicator style={{ marginTop: 12 }} />}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={[styles.videoCard, { backgroundColor: theme.card }]}
          onPress={() => router.push(`/video/${item._id}`)}
        >
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          <View style={styles.videoInfo}>
            <Text
              numberOfLines={2}
              style={{ color: theme.textPrimary, fontWeight: "600" }}
            >
              {item.title}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
              {item.views || 0} views
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  banner: { width: "100%", height: 160 },

  profileCard: {
    marginHorizontal: 16,
    marginTop: -48,
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: "center",
    elevation: 4,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },

  username: { fontSize: 20, fontWeight: "700" },

  subscribeBtn: {
    marginTop: 14,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 22,
  },

  subscribeText: { color: "#fff", fontWeight: "600" },

  myProfileTag: {
    marginTop: 12,
    fontSize: 13,
    color: "green",
    fontWeight: "600",
  },

  logoutBtn: {
    marginTop: 14,
    paddingHorizontal: 36,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
  },

  logoutText: { fontWeight: "600", fontSize: 15 },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
  },

  videoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 3,
  },

  thumbnail: { width: "100%", aspectRatio: 16 / 9 },

  videoInfo: { padding: 12 },
});