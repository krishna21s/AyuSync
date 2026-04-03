import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import {
  Check, Clock, Sunrise, Sun, Moon, Footprints, Pill,
  Coffee, Dumbbell, BedDouble, BookOpen, UtensilsCrossed, Wind, Activity, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRoutine } from "@/hooks/useRoutine";

const periodConfig = {
  morning: { labelKey: "period.morning", icon: Sunrise, tRange: "period.mrange" },
  afternoon: { labelKey: "period.afternoon", icon: Sun, tRange: "period.arange" },
  evening: { labelKey: "period.evening", icon: Sun, tRange: "period.erange" },
  night: { labelKey: "period.night", icon: Moon, tRange: "period.erange" },
};

const iconMap: Record<string, typeof Check> = {
  "wake": Sunrise, "walk": Footprints, "breakfast": UtensilsCrossed,
  "medicine": Pill, "exercise": Dumbbell, "lunch": UtensilsCrossed,
  "meditation": Wind, "tea": Coffee, "dinner": UtensilsCrossed,
  "reading": BookOpen, "sleep": BedDouble,
};

function getTaskIcon(name: string): typeof Check {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return icon;
  }
  return Activity;
}

const Routine = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data, isLoading, toggleTask } = useRoutine();

  if (isLoading || !data) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavbar />
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>)}
                </div>
              </div>
            </main>
          </div>
          <BottomNav />
          <VoiceButton />
        </div>
      </SidebarProvider>
    );
  }

  const { total_tasks, completed_tasks, progress_percent, periods } = data;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="stat-icon-box bg-gray-100">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="elder-heading">{t("routine.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">
                  {completed_tasks}/{total_tasks} {t("routine.desc")}
                </p>
              </motion.div>

              {/* Progress bar */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-dark p-5 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-white">{t("routine.progress")}</span>
                  <span className="text-sm text-white/60 font-semibold">{progress_percent}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress_percent}%` }} transition={{ duration: 1 }} className="h-full bg-primary rounded-full" />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-white/40">{completed_tasks} {t("routine.completed")}</span>
                  <span className="text-[11px] text-white/40">{total_tasks - completed_tasks} {t("routine.remaining")}</span>
                </div>
              </motion.div>

              {/* Routine by period */}
              {(["morning", "afternoon", "evening", "night"] as const).map((period, pi) => {
                const items = periods?.[period] || [];
                if (items.length === 0) return null;
                const config = periodConfig[period];
                const PeriodIcon = config.icon;
                return (
                  <motion.div key={period} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + pi * 0.1 }} className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="stat-icon-box bg-gray-100">
                        <PeriodIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{t(config.labelKey)}</h3>
                      <span className="text-xs text-gray-400 ml-1">{t(config.tRange)}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map((item: any, i: number) => {
                        const TaskIcon = getTaskIcon(item.name);
                        const isNav = item.name.toLowerCase().includes("exercise") || item.name.toLowerCase().includes("meal");
                        const navTo = item.name.toLowerCase().includes("exercise") ? "/exercises" : item.name.toLowerCase().includes("meal") ? "/meals" : null;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + pi * 0.1 + i * 0.04 }}
                            whileHover={{ x: 3 }}
                            className={`card-white-hover p-4 flex items-center justify-between cursor-pointer ${
                              item.is_completed ? "opacity-60" : ""
                            } ${navTo ? "ring-1 ring-primary/10" : ""}`}
                            onClick={() => {
                              if (navTo) {
                                navigate(navTo);
                              } else {
                                toggleTask(item.id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                item.is_completed ? "bg-primary/10" : "bg-gray-50"
                              }`}>
                                {item.is_completed ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <TaskIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${item.is_completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="h-3 w-3 text-gray-300" />
                                  <span className="text-xs text-gray-400">{item.scheduled_time}</span>
                                </div>
                              </div>
                            </div>
                            {navTo ? (
                              <div className="flex items-center gap-1 text-primary">
                                <span className="text-[10px] font-semibold">{t("ex.steps")}</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                item.is_completed ? "bg-primary border-primary" : "border-gray-200"
                              }`}>
                                {item.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
};

export default Routine;
