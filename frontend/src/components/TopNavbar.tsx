import { Bell, Globe } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

export function TopNavbar() {
  const [lang, setLang] = useState<"EN" | "TE">("EN");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:flex hidden" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {getGreeting()}, Yunus 👋
          </h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Let's keep your health on track today
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setLang(lang === "EN" ? "TE" : "EN")}
          className="dark-chip flex items-center gap-1.5 text-xs"
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "EN" ? "EN" : "తె"}
        </button>

        <button className="relative p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
        </button>

        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="w-10 h-10 rounded-xl object-cover border-2 border-primary"
        />
      </div>
    </header>
  );
}
