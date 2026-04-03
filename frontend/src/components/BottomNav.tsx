import { Home, Pill, Plus, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Pill, label: "Medicines", path: "/medicines" },
  { icon: Plus, label: "Add", path: "/add", center: true },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-xl border-t border-border/40 px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {items.map((item) =>
          item.center ? (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-14 h-14 -mt-6 rounded-2xl neon-highlight neon-glow flex items-center justify-center shadow-xl active:scale-90 transition-transform"
            >
              <item.icon className="h-7 w-7" />
            </button>
          ) : (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${
                location.pathname === item.path
                  ? "text-foreground"
                  : ""
              }`}
            >
              <item.icon className={`h-5 w-5 ${location.pathname === item.path ? "text-primary" : ""}`} />
              <span className="text-[11px]">{item.label}</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}
