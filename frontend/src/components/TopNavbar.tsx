import { Bell, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export function TopNavbar() {
  const [lang, setLang] = useState<"EN" | "TE">("EN");
  const location = useLocation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const isDashboard = location.pathname === "/";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:flex hidden" />
        {/* Logo on mobile */}
        <div className="flex items-center gap-2.5 md:hidden">
          <img src="/logo.png" alt="AyuSync" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold tracking-tight">AyuSync</span>
        </div>
        {isDashboard && (
          <div className="hidden md:block">
            <h1 className="text-xl font-bold tracking-tight">
              {getGreeting()}, Yunus 👋
            </h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setLang(lang === "EN" ? "TE" : "EN")}
          className="flex items-center gap-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3.5 py-2 transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "EN" ? "EN" : "తె"}
        </button>

        <button className="relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <Bell className="h-4.5 w-4.5 text-gray-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="w-9 h-9 rounded-xl object-cover border-2 border-primary/50"
        />
      </div>
    </header>
  );
}
