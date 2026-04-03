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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoutineItem {
  id: number;
  time: string;
  tKey: string;
  icon: typeof Check;
  period: "morning" | "afternoon" | "night";
  completed: boolean;
  navigateTo?: string;
}

const initialRoutine: RoutineItem[] = [
  { id: 1, time: "6:00 AM", tKey: "routine.item1", icon: Sunrise, period: "morning", completed: true },
  { id: 2, time: "6:30 AM", tKey: "routine.item2", icon: Footprints, period: "morning", completed: true },
  { id: 3, time: "7:00 AM", tKey: "routine.item3", icon: UtensilsCrossed, period: "morning", completed: true },
  { id: 4, time: "8:00 AM", tKey: "routine.item4", icon: Pill, period: "morning", completed: true },
  { id: 5, time: "10:00 AM", tKey: "routine.item5", icon: Dumbbell, period: "morning", completed: false, navigateTo: "/exercises" },
  { id: 6, time: "12:30 PM", tKey: "routine.item6", icon: UtensilsCrossed, period: "afternoon", completed: false, navigateTo: "/meals" },
  { id: 7, time: "2:30 PM", tKey: "routine.item7", icon: Pill, period: "afternoon", completed: false },
  { id: 8, time: "3:00 PM", tKey: "routine.item8", icon: Wind, period: "afternoon", completed: false },
  { id: 9, time: "5:00 PM", tKey: "routine.item9", icon: Coffee, period: "afternoon", completed: false },
  { id: 10, time: "6:00 PM", tKey: "routine.item10", icon: Footprints, period: "night", completed: false, navigateTo: "/exercises" },
  { id: 11, time: "7:30 PM", tKey: "routine.item11", icon: UtensilsCrossed, period: "night", completed: false, navigateTo: "/meals" },
  { id: 12, time: "9:00 PM", tKey: "routine.item12", icon: Pill, period: "night", completed: false },
  { id: 13, time: "9:30 PM", tKey: "routine.item13", icon: BookOpen, period: "night", completed: false },
  { id: 14, time: "10:00 PM", tKey: "routine.item14", icon: BedDouble, period: "night", completed: false },
];

const periodConfig = {
  morning: { labelKey: "period.morning", icon: Sunrise, tRange: "period.mrange" },
  afternoon: { labelKey: "period.afternoon", icon: Sun, tRange: "period.arange" },
  night: { labelKey: "period.night", icon: Moon, tRange: "period.erange" },
};

const Routine = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(initialRoutine);

  const toggleComplete = (id: number) => {
    setRoutine((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const completed = routine.filter((r) => r.completed).length;
  const progressPct = Math.round((completed / routine.length) * 100);

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
                  {completed}/{routine.length} {t("routine.desc")}
                </p>
              </motion.div>

              {/* Progress bar */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-dark p-5 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-white">{t("routine.progress")}</span>
                  <span className="text-sm text-white/60 font-semibold">{progressPct}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-white/40">{completed} {t("routine.completed")}</span>
                  <span className="text-[11px] text-white/40">{routine.length - completed} {t("routine.remaining")}</span>
                </div>
              </motion.div>

              {/* Routine by period */}
              {(["morning", "afternoon", "night"] as const).map((period, pi) => {
                const items = routine.filter((r) => r.period === period);
                const config = periodConfig[period];
                const PeriodIcon = config.icon;
                return (
                  <motion.div
                    key={period}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + pi * 0.1 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="stat-icon-box bg-gray-100">
                        <PeriodIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{t(config.labelKey)}</h3>
                      <span className="text-xs text-gray-400 ml-1">{t(config.tRange)}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + pi * 0.1 + i * 0.04 }}
                            whileHover={{ x: 3 }}
                            className={`card-white-hover p-4 flex items-center justify-between cursor-pointer ${
                              item.completed ? "opacity-60" : ""
                            } ${item.navigateTo ? "ring-1 ring-primary/10" : ""}`}
                            onClick={() => {
                              if (item.navigateTo) {
                                navigate(item.navigateTo);
                              } else {
                                toggleComplete(item.id);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                  item.completed ? "bg-primary/10" : "bg-gray-50"
                                }`}
                              >
                                {item.completed ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <ItemIcon className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className={`font-semibold text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                                  {t(item.tKey)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="h-3 w-3 text-gray-300" />
                                  <span className="text-xs text-gray-400">{item.time}</span>
                                </div>
                              </div>
                            </div>
                            {item.navigateTo ? (
                              <div className="flex items-center gap-1 text-primary">
                                <span className="text-[10px] font-semibold">{t("ex.steps")}</span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            ) : (
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  item.completed
                                    ? "bg-primary border-primary"
                                    : "border-gray-200"
                                }`}
                              >
                                {item.completed && <Check className="h-3 w-3 text-primary-foreground" />}
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
