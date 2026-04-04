import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, User, Bell, Globe, Shield, Moon,
  Smartphone, Volume2, Heart, LogOut, ChevronRight, Clock,
  Check, AlertCircle, MessageSquare, UserCheck, Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface SettingToggle {
  id: string;
  labelKey: string;
  descKey: string;
  icon: typeof User;
  enabled: boolean;
}

const Settings = () => {
  const { t } = useLanguage();
  const { user, logout, updateProfile, sendOTP, verifyOTP } = useAuth();

  // Caretaker & report time state
  const [caretakerPhone, setCaretakerPhone] = useState(user?.caretaker_phone || "");
  const [reportTime, setReportTime] = useState(user?.report_time || "21:00");
  const [savingCaretaker, setSavingCaretaker] = useState(false);
  const [caretakerSaved, setCaretakerSaved] = useState(false);
  const [caretakerError, setCaretakerError] = useState("");

  // OTP verification (re-verify phone)
  const [verifyPhone, setVerifyPhone] = useState(user?.phone || "");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  useEffect(() => {
    if (user) {
      setCaretakerPhone(user.caretaker_phone || "");
      setReportTime(user.report_time || "21:00");
      setVerifyPhone(user.phone || "");
    }
  }, [user]);

  const [toggles, setToggles] = useState<SettingToggle[]>([
    { id: "notifications", labelKey: "settings.push", descKey: "settings.pushDesc", icon: Bell, enabled: true },
    { id: "sound", labelKey: "settings.sound", descKey: "settings.soundDesc", icon: Volume2, enabled: true },
    { id: "darkmode", labelKey: "settings.dark", descKey: "settings.darkDesc", icon: Moon, enabled: false },
    { id: "vibration", labelKey: "settings.vib", descKey: "settings.vibDesc", icon: Smartphone, enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const saveCaretaker = async () => {
    setSavingCaretaker(true);
    setCaretakerError("");
    try {
      await updateProfile({
        caretaker_phone: caretakerPhone || null,
        report_time: reportTime,
      } as any);
      setCaretakerSaved(true);
      setTimeout(() => setCaretakerSaved(false), 2500);
    } catch (err: any) {
      setCaretakerError(err.message || "Failed to save");
    } finally {
      setSavingCaretaker(false);
    }
  };

  const handleSendOTP = async () => {
    if (!verifyPhone) return;
    setVerifyLoading(true);
    setVerifyMsg("");
    try {
      // Update phone first if changed
      if (verifyPhone !== user?.phone) {
        await updateProfile({ phone: verifyPhone } as any);
      }
      await sendOTP(verifyPhone);
      setOtpSent(true);
      setVerifyMsg("OTP sent to your WhatsApp!");
    } catch (err: any) {
      setVerifyMsg(err.message || "Failed to send OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) return;
    setVerifyLoading(true);
    setVerifyMsg("");
    try {
      await verifyOTP(verifyPhone, otpCode);
      setOtpSent(false);
      setOtpCode("");
      setVerifyMsg("Phone verified! WhatsApp alerts are now active ✅");
    } catch (err: any) {
      setVerifyMsg(err.message || "Invalid OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  const menuItems = [
    { labelKey: "settings.langPref", icon: Globe },
    { labelKey: "settings.schedule", icon: Clock },
    { labelKey: "settings.privacy", icon: Shield },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="stat-icon-box bg-gray-100">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="elder-heading">{t("settings.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("settings.desc")}</p>
              </motion.div>

              {/* Profile Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-dark p-6 mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{user?.name || "User"}</h3>
                    <p className="text-white/50 text-sm">{user?.email}</p>
                    {user?.phone && (
                      <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${user.phone_verified ? "text-primary" : "text-orange-400"}`}>
                        {user.phone_verified ? <><Check className="h-3 w-3" /> {user.phone} — WhatsApp Active</> : <><AlertCircle className="h-3 w-3" /> {user.phone} — Not Verified</>}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ── WhatsApp & OTP Verification ─────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-white p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="stat-icon-box bg-gray-100">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">WhatsApp Verification</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your WhatsApp Number</label>
                    <div className="flex gap-2">
                      <input type="tel" value={verifyPhone} onChange={(e) => setVerifyPhone(e.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button onClick={handleSendOTP} disabled={verifyLoading || !verifyPhone}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 active:scale-95 transition-all whitespace-nowrap"
                      >
                        {user?.phone_verified ? "Re-verify" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Enter OTP from WhatsApp</label>
                      <div className="flex gap-2">
                        <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit OTP" maxLength={6}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono tracking-widest"
                        />
                        <button onClick={handleVerifyOTP} disabled={verifyLoading || otpCode.length < 6}
                          className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold disabled:opacity-40 active:scale-95 transition-all"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {verifyMsg && (
                    <p className={`text-xs font-medium px-3 py-2 rounded-lg ${verifyMsg.includes("✅") || verifyMsg.includes("sent") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {verifyMsg}
                    </p>
                  )}

                  {user?.phone_verified && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-green-700">WhatsApp alerts are active. You'll receive medicine reminders and caretaker alerts.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── Caretaker & Daily Report ─────────────────────────────── */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-white p-5 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="stat-icon-box bg-gray-100">
                    <Heart className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Caretaker & Daily Report</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Caretaker's WhatsApp Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <input type="tel" value={caretakerPhone} onChange={(e) => setCaretakerPhone(e.target.value)}
                        placeholder="+91XXXXXXXXXX (family member / doctor)"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">They'll receive missed dose alerts and daily health reports automatically.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      Daily Report Time
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                      <input type="time" value={reportTime} onChange={(e) => setReportTime(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">Caretaker receives the daily summary at this time every day.</p>
                  </div>

                  {caretakerError && (
                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{caretakerError}</p>
                  )}

                  <button onClick={saveCaretaker} disabled={savingCaretaker}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      caretakerSaved ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {caretakerSaved ? <><Check className="h-4 w-4" /> Saved!</> : savingCaretaker ? "Saving…" : "Save Caretaker Settings"}
                  </button>
                </div>
              </motion.div>

              {/* Quick Toggles */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-white p-1.5 mb-5">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2">{t("settings.quickSettings")}</h3>
                {toggles.map((toggle, i) => (
                  <motion.div key={toggle.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleSetting(toggle.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="stat-icon-box bg-gray-100">
                        <toggle.icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{t(toggle.labelKey)}</p>
                        <p className="text-xs text-gray-400">{t(toggle.descKey)}</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${toggle.enabled ? "bg-primary" : "bg-gray-200"}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${toggle.enabled ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Account menu */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-white p-1.5 mb-5">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2">{t("settings.account")}</h3>
                {menuItems.map((item, i) => (
                  <motion.button key={item.labelKey} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.04 }}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="stat-icon-box bg-gray-100">
                        <item.icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{t(item.labelKey)}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </motion.button>
                ))}
              </motion.div>

              {/* Logout */}
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                onClick={() => logout()}
                className="w-full card-white p-4 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("settings.signOut")}
              </motion.button>
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
};

export default Settings;
