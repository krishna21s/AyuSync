/**
 * AuthContext — OTP-first mobile authentication.
 * Login flow: email+password → OTP sent to WhatsApp → verify OTP → JWT
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  language: string;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  caretaker_phone: string | null;
  report_time: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  // Step 1: returns { otp_required, phone } or logs in directly
  login: (email: string, password: string) => Promise<{ otp_required: boolean; phone?: string }>;
  // Step 2: verify OTP and get JWT
  verifyOTP: (phone: string, code: string) => Promise<void>;
  // Resend OTP
  sendOTP: (phone: string) => Promise<void>;
  // Register (with optional phone)
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ otp_required: boolean }>;
  // Update profile (caretaker, report_time, etc.)
  updateProfile: (data: Partial<User>) => Promise<void>;
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

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<{ success: boolean; data: User }>("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
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

  /** Step 1: validate credentials, returns whether OTP is required */
  const login = async (email: string, password: string) => {
    const res = await api.post<{
      success: boolean;
      data: {
        otp_required: boolean;
        phone?: string;
        access_token?: string;
        user?: User;
      };
    }>("/auth/login", { email, password });

    if (!res.data.otp_required && res.data.access_token && res.data.user) {
      // No phone on account — direct login
      saveAuth(res.data.access_token, res.data.user);
    }

    return { otp_required: res.data.otp_required, phone: res.data.phone };
  };

  /** Step 2: verify OTP → get JWT */
  const verifyOTP = async (phone: string, code: string) => {
    const res = await api.post<{
      success: boolean;
      data: { access_token: string; user: User };
    }>("/auth/verify-otp", { phone, code });
    saveAuth(res.data.access_token, res.data.user);
  };

  /** Resend OTP */
  const sendOTP = async (phone: string) => {
    await api.post("/auth/send-otp", { phone });
  };

  /** Register with optional phone */
  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post<{
      success: boolean;
      data: {
        otp_required: boolean;
        otp_sent: boolean;
        access_token: string;
        user: User;
      };
    }>("/auth/register", { name, email, password, phone: phone || null });

    // Always get a token at registration
    saveAuth(res.data.access_token, res.data.user);
    return { otp_required: res.data.otp_required };
  };

  /** Update profile (caretaker_phone, report_time, etc.) */
  const updateProfile = async (data: Partial<User>) => {
    const res = await api.patch<{ success: boolean; data: User }>("/users/me", data);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, verifyOTP, sendOTP, register, updateProfile, logout }}
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
