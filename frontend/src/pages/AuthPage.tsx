/**
 * AuthPage — OTP-first mobile authentication.
 *
 * Login flow:   email + password → OTP sent to WhatsApp → verify OTP → Dashboard
 * Register flow: name + email + password + phone → account created → OTP step (if phone) → Dashboard
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Smartphone, ShieldCheck, ChevronLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "register";
type Step = "credentials" | "otp";

export default function AuthPage() {
  const { login, register, verifyOTP, sendOTP } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("credentials");

  // Credentials step
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);

  // OTP step
  const [otpPhone, setOtpPhone] = useState(""); // phone awaiting OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Credentials Submit ────────────────────────────────────────────────────

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (res.otp_required && res.phone) {
          setOtpPhone(res.phone);
          setStep("otp");
        } else {
          navigate("/");
        }
      } else {
        // Register
        if (!name.trim()) { setError("Name is required"); return; }
        const cleanPhone = phone.trim() || undefined;
        const res = await register(name, email, password, cleanPhone);
        if (res.otp_required && cleanPhone) {
          setOtpPhone(cleanPhone);
          setStep("otp");
        } else {
          navigate("/");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Submit ────────────────────────────────────────────────────────────

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code"); return; }
    setError("");
    setLoading(true);
    try {
      await verifyOTP(otpPhone, code);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await sendOTP(otpPhone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    }
  };

  // ── OTP digit input handler ───────────────────────────────────────────────

  const handleOtpDigit = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const maskPhone = (p: string) => p.slice(0, -4).replace(/\d/g, "*") + p.slice(-4);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <img src="/logo.png" alt="AyuSync Logo" className="h-20 w-auto mx-auto mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">AyuSync</h1>
          <p className="text-gray-500 mt-1 text-sm">Your personal health & medicine companion</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ─── Credentials Step ─────────────────────────────────────── */}
          {step === "credentials" && (
            <motion.div key="credentials" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
            >
              {/* Mode toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
                {(["login", "register"] as Mode[]).map((m) => (
                  <button key={m} type="button"
                    onClick={() => { setMode(m); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      mode === m ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                {/* Name */}
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required minLength={6}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone — register + optional for login hint */}
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      WhatsApp Number <span className="text-gray-400 text-xs">(enables OTP & alerts)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 font-medium">
                        <Smartphone className="h-3.5 w-3.5 mr-1 text-gray-400" /> +91
                      </div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.startsWith("+") ? e.target.value : `+91${e.target.value.replace(/\D/g, "")}`)}
                        placeholder="+91XXXXXXXXXX"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> OTP will be sent via WhatsApp
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
                  className="text-primary font-semibold hover:underline">
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </motion.div>
          )}

          {/* ─── OTP Verification Step ───────────────────────────────── */}
          {step === "otp" && (
            <motion.div key="otp" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
            >
              <button onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Your Number</h2>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit OTP to WhatsApp on<br />
                  <span className="font-semibold text-gray-700">{maskPhone(otpPhone)}</span>
                </p>
              </div>

              <form onSubmit={handleOtp} className="space-y-6">
                {/* OTP boxes */}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpDigit(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:border-primary ${
                        digit ? "border-primary bg-primary/5" : "border-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || otp.join("").length < 6}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Continue
                </button>

                <p className="text-center text-sm text-gray-500">
                  Didn't receive it?{" "}
                  <button type="button" onClick={handleResend} className="text-primary font-semibold hover:underline">
                    Resend OTP
                  </button>
                </p>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
