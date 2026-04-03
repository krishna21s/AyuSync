import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, User, Bell, Globe, Shield, Moon,
  Smartphone, Volume2, Heart, LogOut, ChevronRight, Clock
} from "lucide-react";
import { useState } from "react";

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: typeof User;
  enabled: boolean;
}

const Settings = () => {
  const [toggles, setToggles] = useState<SettingToggle[]>([
    { id: "notifications", label: "Push Notifications", description: "Get reminders for medicines", icon: Bell, enabled: true },
    { id: "sound", label: "Sound Alerts", description: "Play sound for medicine reminders", icon: Volume2, enabled: true },
    { id: "darkmode", label: "Dark Mode", description: "Switch to dark theme", icon: Moon, enabled: false },
    { id: "vibration", label: "Vibration", description: "Vibrate on notifications", icon: Smartphone, enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const menuItems = [
    { label: "Edit Profile", icon: User },
    { label: "Language Preferences", icon: Globe },
    { label: "Reminder Schedule", icon: Clock },
    { label: "Health Data & Privacy", icon: Shield },
    { label: "Emergency Contact", icon: Heart },
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
                  <h2 className="elder-heading">Settings</h2>
                </div>
                <p className="text-gray-500 text-sm">Personalize your AyuSync experience</p>
              </motion.div>

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-dark p-6 mb-5"
              >
                <div className="flex items-center gap-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Profile"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/50"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">Yunus</h3>
                    <p className="text-white/50 text-sm">yunus@example.com</p>
                    <p className="text-primary text-xs font-semibold mt-1 flex items-center gap-1">
                      <Heart className="h-3 w-3" /> Premium Health Plan
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Toggles */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card-white p-1.5 mb-5"
              >
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2">Quick Settings</h3>
                {toggles.map((toggle, i) => (
                  <motion.div
                    key={toggle.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleSetting(toggle.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="stat-icon-box bg-gray-100">
                        <toggle.icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{toggle.label}</p>
                        <p className="text-xs text-gray-400">{toggle.description}</p>
                      </div>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${
                      toggle.enabled ? "bg-primary" : "bg-gray-200"
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        toggle.enabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Menu Items */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="card-white p-1.5 mb-5"
              >
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-3 pb-2">Account</h3>
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="stat-icon-box bg-gray-100">
                        <item.icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </motion.button>
                ))}
              </motion.div>

              {/* Logout */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full card-white p-4 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
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
