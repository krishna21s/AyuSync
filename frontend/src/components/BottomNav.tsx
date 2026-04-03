import { Home, Pill, Plus, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const items = [
  { icon: Home, tKey: "nav.home", path: "/" },
  { icon: Pill, tKey: "nav.medicines", path: "/medicines" },
  { icon: Plus, tKey: "nav.add", path: "/medicines", center: true },
  { icon: BarChart3, tKey: "nav.reports", path: "/reports" },
  { icon: User, tKey: "nav.profile", path: "/settings" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-xl border-t border-border/40 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {items.map((item) =>
          item.center ? (
            <button
              key={item.tKey}
              onClick={() => navigate(item.path)}
              className="w-14 h-14 -mt-6 rounded-2xl neon-highlight flex items-center justify-center shadow-xl active:scale-90 transition-transform"
            >
              <item.icon className="h-7 w-7" />
            </button>
          ) : (
            <button
              key={item.tKey}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${
                location.pathname === item.path
                  ? "text-foreground"
                  : ""
              }`}
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? "text-primary" : ""}`} />
              <span className="text-[11px]">{t(item.tKey)}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}
