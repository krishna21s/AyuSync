import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { useState } from "react";

interface RoutineItem {
  id: number;
  time: string;
  label: string;
  icon: string;
  period: "morning" | "afternoon" | "night";
  completed: boolean;
}

const initialRoutine: RoutineItem[] = [
  { id: 1, time: "6:00 AM", label: "Wake Up & Stretch", icon: "🌅", period: "morning", completed: true },
  { id: 2, time: "6:30 AM", label: "Morning Walk (15 min)", icon: "🚶", period: "morning", completed: true },
  { id: 3, time: "7:00 AM", label: "Breakfast", icon: "🍳", period: "morning", completed: true },
  { id: 4, time: "8:00 AM", label: "Morning Medicines", icon: "💊", period: "morning", completed: true },
  { id: 5, time: "10:00 AM", label: "Light Exercise / Yoga", icon: "🧘", period: "morning", completed: false },
  { id: 6, time: "12:30 PM", label: "Lunch", icon: "🍛", period: "afternoon", completed: false },
  { id: 7, time: "2:30 PM", label: "Afternoon Medicines", icon: "💊", period: "afternoon", completed: false },
  { id: 8, time: "3:00 PM", label: "Rest / Nap", icon: "😌", period: "afternoon", completed: false },
  { id: 9, time: "5:00 PM", label: "Evening Tea & Snack", icon: "☕", period: "afternoon", completed: false },
  { id: 10, time: "6:00 PM", label: "Evening Walk (20 min)", icon: "🌆", period: "night", completed: false },
  { id: 11, time: "7:30 PM", label: "Dinner", icon: "🍽️", period: "night", completed: false },
  { id: 12, time: "9:00 PM", label: "Night Medicines", icon: "💊", period: "night", completed: false },
  { id: 13, time: "9:30 PM", label: "Warm Milk / Reading", icon: "📖", period: "night", completed: false },
  { id: 14, time: "10:00 PM", label: "Sleep", icon: "😴", period: "night", completed: false },
];

const periodLabels = {
  morning: { label: "Morning", icon: "🌅", range: "6 AM – 12 PM" },
  afternoon: { label: "Afternoon", icon: "☀️", range: "12 PM – 5 PM" },
  night: { label: "Evening & Night", icon: "🌙", range: "5 PM – 10 PM" },
};

const Routine = () => {
  const [routine, setRoutine] = useState(initialRoutine);

  const toggleComplete = (id: number) => {
    setRoutine((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const completed = routine.filter((r) => r.completed).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h2 className="elder-heading mb-2">🧘 Daily Routine</h2>
                <p className="text-muted-foreground">
                  {completed}/{routine.length} tasks completed today
                </p>
              </motion.div>

              {/* Progress bar */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Today's Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round((completed / routine.length) * 100)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completed / routine.length) * 100}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </motion.div>

              {/* Routine by period */}
              {(["morning", "afternoon", "night"] as const).map((period, pi) => {
                const items = routine.filter((r) => r.period === period);
                const info = periodLabels[period];
                return (
                  <motion.div
                    key={period}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + pi * 0.1 }}
                    className="mb-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{info.icon}</span>
                      <h3 className="text-lg font-bold text-foreground">{info.label}</h3>
                      <span className="text-sm text-muted-foreground ml-1">{info.range}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + pi * 0.1 + i * 0.04 }}
                          className={`glass-card-hover p-4 flex items-center justify-between cursor-pointer ${
                            item.completed ? "opacity-70" : ""
                          }`}
                          onClick={() => toggleComplete(item.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                item.completed ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              {item.completed ? (
                                <Check className="h-5 w-5 text-primary" />
                              ) : (
                                <span className="text-lg">{item.icon}</span>
                              )}
                            </div>
                            <div>
                              <p className={`font-semibold text-base ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {item.label}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{item.time}</span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              item.completed
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30"
                            }`}
                          >
                            {item.completed && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </motion.div>
                      ))}
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
