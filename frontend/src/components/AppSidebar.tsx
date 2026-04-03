import { LayoutDashboard, Pill, Activity, BarChart3, Settings, Dumbbell, UtensilsCrossed, Brain } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { translationKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { translationKey: "nav.medicines", url: "/medicines", icon: Pill },
  { translationKey: "nav.routine", url: "/routine", icon: Activity },
  { translationKey: "nav.exercises", url: "/exercises", icon: Dumbbell },
  { translationKey: "nav.meals", url: "/meals", icon: UtensilsCrossed },
  { translationKey: "nav.reports", url: "/reports", icon: BarChart3 },
  { translationKey: "nav.healthRisk", url: "/health-risk", icon: Brain },
  { translationKey: "nav.settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useLanguage();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-6">
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="AyuSync"
              className="w-10 rounded-xl object-contain"
            />
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-foreground">
                AyuSync
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.translationKey}>
                  <SidebarMenuButton asChild className="h-12 rounded-xl text-base">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 text-muted-foreground hover:bg-muted/60 rounded-xl transition-all"
                      activeClassName="bg-primary text-primary-foreground font-semibold neon-glow"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{t(item.translationKey)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
