/**
 * AuthContext — stores current user + token.
 * Wraps the whole app so any component can read auth state.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  language: string;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "healthai_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  // On mount, if a token exists try to fetch the current user
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<{ success: boolean; data: User }>("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        // Token invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const saveAuth = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<{
      success: boolean;
      data: { access_token: string; user: User };
    }>("/auth/login", { email, password });
    saveAuth(res.data.access_token, res.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<{
      success: boolean;
      data: { access_token: string; user: User };
    }>("/auth/register", { name, email, password });
    saveAuth(res.data.access_token, res.data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
