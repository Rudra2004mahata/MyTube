import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  useColorScheme,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext";

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

/* ================= BASE URL ================= */
const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000/api/v1"
    : "http://10.49.98.86:8000/api/v1";

export default function UploadScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const params = useLocalSearchParams();
  const videoUri = params?.videoUri as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /* ================= PICK THUMBNAIL ================= */
  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setThumbnailUri(result.assets[0].uri);
    }
  };

  /* ================= GET TOKEN ================= */
  const getToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem("accessToken");
    }
    return await SecureStore.getItemAsync("accessToken");
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!title || !description || !videoUri || !thumbnailUri) {
      Alert.alert("Missing fields", "Please fill all fields and select a thumbnail");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      if (Platform.OS === "web") {
        const videoBlob = await (await fetch(videoUri)).blob();
        const thumbBlob = await (await fetch(thumbnailUri)).blob();

        formData.append("videoFile", videoBlob, "video.mp4");
        formData.append("thumbnail", thumbBlob, "thumbnail.jpg");
      } else {
        formData.append("videoFile", {
          uri: videoUri,
          name: `video-${Date.now()}.mp4`,
          type: "video/mp4",
        } as any);

        formData.append("thumbnail", {
          uri: thumbnailUri,
          name: `thumbnail-${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
      }

      const token = await getToken();

      const response = await fetch(`${BASE_URL}/videos`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      Alert.alert("Success 🎉", "Video uploaded successfully");
      router.replace("/");

    } catch (error) {
      Alert.alert("Upload Error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🔥 CENTERED CONTENT */}
      <View style={styles.content}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Upload Video
        </Text>

        <Text style={[styles.helper, { color: theme.subText }]}>
          Add details to publish your video
        </Text>

        <TextInput
          placeholder="Video title"
          placeholderTextColor={theme.subText}
          value={title}
          onChangeText={setTitle}
          style={[
            styles.input,
            { backgroundColor: theme.inputBg, color: theme.text },
          ]}
        />

        <TextInput
          placeholder="Video description"
          placeholderTextColor={theme.subText}
          value={description}
          onChangeText={setDescription}
          multiline
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              color: theme.text,
              height: 100,
            },
          ]}
        />

        <Pressable style={styles.thumbBtn} onPress={pickThumbnail}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {thumbnailUri ? "Change Thumbnail" : "Pick Thumbnail"}
          </Text>
        </Pressable>

        {thumbnailUri && (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        )}

        {uploading && (
          <Text style={{ color: theme.text, marginVertical: 8 }}>
            Uploading…
          </Text>
        )}

        <Pressable
          style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadText}>Upload</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // 🔥 vertical center
    padding: 16,
  },

  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  helper: {
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
  },

  input: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },

  thumbBtn: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },

  uploadBtn: {
    backgroundColor: "#ff0000",
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  uploadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});