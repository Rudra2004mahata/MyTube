import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  useColorScheme,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { api } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

/* ================= THEME ================= */
const lightTheme = {
  background: "#ffffff",
  text: "#000000",
  subText: "#666666",
  card: "#f5f5f5",
  reply: "#eaeaea",
  border: "#dddddd",
};

const darkTheme = {
  background: "#0f0f0f",
  text: "#ffffff",
  subText: "#aaaaaa",
  card: "#1c1c1c",
  reply: "#2a2a2a",
  border: "#333333",
};

export default function VideoWatchScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const [videoData, setVideoData] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH VIDEO ================= */
  useEffect(() => {
    if (!id) return;

    const fetchVideo = async () => {
      const res = await api.get(`/videos/${id}`);
      setVideoData(res.data.data);
      setLoading(false);
    };

    fetchVideo();
  }, [id]);

  /* ================= VIDEO PLAYER ================= */
  const player = useVideoPlayer(videoData?.videoFile ?? "", (player) => {
    player.loop = false;
    player.play();
  });

  /* ================= COMMENTS ================= */
  const fetchComments = async () => {
    const res = await api.get(`/comments/${id}?page=1&limit=5`);
    setComments(res.data.data.docs || []);
  };

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    const res = await api.patch(`/likes/video/${id}`);
    const isLiked = res.data.data.liked;

    setLiked(isLiked);
    setVideoData((prev: any) => ({
      ...prev,
      likesCount: isLiked
        ? (prev.likesCount || 0) + 1
        : Math.max((prev.likesCount || 1) - 1, 0),
    }));
  };

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await api.post(`/comments/${id}`, { content: newComment });
    setNewComment("");
    fetchComments();
  };

  /* ================= ADD REPLY ================= */
  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim()) return;

    await api.post(`/comments/${id}`, {
      content: replyText,
      parentComment: parentCommentId,
    });

    setReplyText("");
    setReplyingTo(null);
    fetchComments();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      {/* ================= VIDEO ================= */}
      <View style={styles.videoWrapper}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>

      {/* ================= DETAILS ================= */}
      <View style={styles.details}>
        <Text style={[styles.title, { color: theme.text }]}>
          {videoData.title}
        </Text>

        <Text style={{ color: theme.subText }}>
          {videoData.views} views
        </Text>

        <Pressable onPress={handleLike} style={styles.likeRow}>
          <Text style={styles.likeIcon}>{liked ? "❤️" : "🤍"}</Text>
          <Text style={{ color: theme.text }}>
            {videoData.likesCount ?? 0} Likes
          </Text>
        </Pressable>

        <Text style={{ marginTop: 12, color: theme.text }}>
          {videoData.description}
        </Text>
      </View>

      {/* ================= COMMENTS ================= */}
      <View style={styles.commentSection}>
        <Text style={[styles.commentTitle, { color: theme.text }]}>
          Comments ({comments.length})
        </Text>

        <View style={styles.commentInputRow}>
          <TextInput
            placeholder="Add a comment..."
            placeholderTextColor={theme.subText}
            value={newComment}
            onChangeText={setNewComment}
            style={[
              styles.commentInput,
              { borderColor: theme.border, color: theme.text },
            ]}
          />
          <Pressable onPress={handleAddComment}>
            <Text style={styles.postBtn}>Post</Text>
          </Pressable>
        </View>

        {comments.map((comment) => (
          <View
            key={comment._id}
            style={[styles.commentCard, { backgroundColor: theme.card }]}
          >
            <Text style={{ fontWeight: "600", color: theme.text }}>
              {comment.owner?.username || "User"}
            </Text>

            <Text style={{ color: theme.text }}>{comment.content}</Text>

            <Pressable onPress={() => setReplyingTo(comment._id)}>
              <Text style={{ color: "#007bff", marginTop: 6 }}>Reply</Text>
            </Pressable>

            {replyingTo === comment._id && (
              <View style={{ marginTop: 6 }}>
                <TextInput
                  placeholder="Write a reply..."
                  placeholderTextColor={theme.subText}
                  value={replyText}
                  onChangeText={setReplyText}
                  style={[
                    styles.commentInput,
                    { borderColor: theme.border, color: theme.text },
                  ]}
                />
                <Pressable onPress={() => handleAddReply(comment._id)}>
                  <Text style={styles.postBtn}>Reply</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  videoWrapper: {
    width: "100%",
    backgroundColor: "black",
    aspectRatio: 16 / 9, // 🔥 FIXED
  },

  video: {
    width: "100%",
    height: "100%",
  },

  details: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700" },

  likeRow: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  likeIcon: { fontSize: 22, marginRight: 6 },

  commentSection: { padding: 16 },
  commentTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },

  postBtn: { color: "#ff0000", fontWeight: "600" },

  commentCard: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
});