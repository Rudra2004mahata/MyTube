import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

/* ---------------- TYPES ---------------- */

type User = {
  _id: string;
  username?: string;
  email?: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

/* ---------------- CONTEXT ---------------- */

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------- TOKEN STORAGE ---------------- */

const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("accessToken");
  }
  return await SecureStore.getItemAsync("accessToken");
};

const setTokenStorage = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem("accessToken", token);
  } else {
    await SecureStore.setItemAsync("accessToken", token);
  }
};

const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("accessToken");
  } else {
    await SecureStore.deleteItemAsync("accessToken");
  }
};

/* ---------------- PROVIDER ---------------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();

      if (storedToken) {
        setToken(storedToken);
        try {
          const decoded: any = jwtDecode(storedToken);
          setUser({
            _id: decoded._id,
            username: decoded.username,
            email: decoded.email,
          });
        } catch (err) {
          console.log("JWT decode failed");
        }
      }

      setLoading(false);
    };

    loadToken();
  }, []);

  const login = async (newToken: string) => {
    await setTokenStorage(newToken);
    setToken(newToken);

    const decoded: any = jwtDecode(newToken);
    setUser({
      _id: decoded._id,
      username: decoded.username,
      email: decoded.email,
    });
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

