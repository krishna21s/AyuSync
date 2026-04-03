import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Play, Clock, Flame, ChevronRight, X,
  Zap, Target, Timer, Check, RotateCcw
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type ExCategory = "all" | "yoga" | "walking" | "stretching";
type ExPhase = "warmup" | "main" | "cooldown";

interface Exercise {
  id: number;
  nameKey: string;
  descKey: string;
  image: string;
  duration: string;
  durationVal: number; // seconds for timer
  reps?: string;
  difficulty: "easy" | "medium";
  muscleKey: string;
  phase: ExPhase;
  category: ExCategory[];
  steps: string[];
}

const exercises: Exercise[] = [
  {
    id: 1, nameKey: "ex.neckRotation", descKey: "ex.neckDesc",
    image: "/exercises/neck-rotation.png", duration: "30", durationVal: 30,
    reps: "10", difficulty: "easy", muscleKey: "ex.neck",
    phase: "warmup", category: ["all", "stretching"],
    steps: ["Stand or sit straight", "Slowly tilt head to the right", "Rotate clockwise for 5 reps", "Repeat anti-clockwise"],
  },
  {
    id: 2, nameKey: "ex.shoulderStretch", descKey: "ex.shoulderDesc",
    image: "/exercises/shoulder-stretch.png", duration: "45", durationVal: 45,
    reps: "8", difficulty: "easy", muscleKey: "ex.shoulders",
    phase: "warmup", category: ["all", "stretching", "yoga"],
    steps: ["Stand with feet shoulder-width apart", "Raise both arms above head", "Interlock fingers and stretch upward", "Hold for 5 seconds, release"],
  },
  {
    id: 3, nameKey: "ex.seatedBend", descKey: "ex.seatedDesc",
    image: "/exercises/seated-bend.png", duration: "60", durationVal: 60,
    difficulty: "medium", muscleKey: "ex.back",
    phase: "main", category: ["all", "yoga"],
    steps: ["Sit on a mat with legs straight", "Inhale and raise your arms", "Exhale and bend forward slowly", "Try to touch your toes, hold 10 sec"],
  },
  {
    id: 4, nameKey: "ex.sideStretch", descKey: "ex.sideDesc",
    image: "/exercises/side-stretch.png", duration: "45", durationVal: 45,
    reps: "6", difficulty: "easy", muscleKey: "ex.obliques",
    phase: "main", category: ["all", "stretching"],
    steps: ["Stand straight, feet hip-width apart", "Raise right arm above head", "Bend gently to the left side", "Hold 5 sec, switch sides"],
  },
  {
    id: 5, nameKey: "ex.ankleRotation", descKey: "ex.ankleDesc",
    image: "/exercises/ankle-rotation.png", duration: "30", durationVal: 30,
    reps: "10", difficulty: "easy", muscleKey: "ex.ankles",
    phase: "cooldown", category: ["all", "stretching", "walking"],
    steps: ["Sit in a chair comfortably", "Lift right foot off the ground", "Rotate ankle clockwise 10 times", "Switch direction, then switch feet"],
  },
  {
    id: 6, nameKey: "ex.deepBreathing", descKey: "ex.breathDesc",
    image: "/exercises/deep-breathing.png", duration: "120", durationVal: 120,
    difficulty: "easy", muscleKey: "ex.lungs",
    phase: "cooldown", category: ["all", "yoga"],
    steps: ["Sit cross-legged or in a chair", "Close your eyes gently", "Inhale deeply through nose (4 sec)", "Hold breath (4 sec)", "Exhale slowly through mouth (6 sec)", "Repeat 8–10 times"],
  },
];

const tabKeys: { key: ExCategory; tKey: string }[] = [
  { key: "all", tKey: "ex.tabAll" },
  { key: "yoga", tKey: "ex.tabYoga" },
  { key: "walking", tKey: "ex.tabWalk" },
  { key: "stretching", tKey: "ex.tabStretch" },
];

const phaseConfig: { key: ExPhase; tKey: string; icon: typeof Flame }[] = [
  { key: "warmup", tKey: "ex.warmup", icon: Flame },
  { key: "main", tKey: "ex.main", icon: Zap },
  { key: "cooldown", tKey: "ex.cooldown", icon: RotateCcw },
];

// Timer component
function WorkoutTimer({ totalSeconds, onComplete }: { totalSeconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining <= 0 && running) {
      setRunning(false);
      onComplete();
    }
  }, [remaining, running, onComplete]);

  const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" className="stroke-gray-100" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" className="stroke-primary" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 tabular-nums">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <button
        onClick={() => setRunning((r) => !r)}
        className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 active:scale-95 transition-all ${
          running
            ? "bg-gray-900 text-white"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {running ? (
          <><Timer className="h-4 w-4" /> Pause</>
        ) : remaining < totalSeconds ? (
          <><Play className="h-4 w-4" /> Resume</>
        ) : (
          <><Play className="h-4 w-4" /> Start</>
        )}
      </button>
    </div>
  );
}

const Exercises = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<ExCategory>("all");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const filtered = exercises.filter((e) => e.category.includes(tab));

  const markDone = useCallback((id: number) => {
    setCompleted((prev) => new Set([...prev, id]));
  }, []);

  const totalDuration = exercises.reduce((s, e) => s + e.durationVal, 0);
  const doneDuration = exercises
    .filter((e) => completed.has(e.id))
    .reduce((s, e) => s + e.durationVal, 0);
  const progressPct = Math.round((doneDuration / totalDuration) * 100);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="stat-icon-box bg-gray-100">
                    <Dumbbell className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="elder-heading">{t("ex.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("ex.desc")}</p>
              </motion.div>

              {/* Progress Card */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="card-dark p-5 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-white">{t("routine.progress")}</span>
                  <span className="text-sm text-white/60 font-semibold">{progressPct}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-white/40">{completed.size}/{exercises.length} {t("routine.completed")}</span>
                  <span className="text-[11px] text-white/40">{Math.round(totalDuration / 60)} {t("ex.min")} total</span>
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
                {tabKeys.map((tb) => (
                  <button
                    key={tb.key}
                    onClick={() => setTab(tb.key)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      tab === tb.key
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t(tb.tKey)}
                  </button>
                ))}
              </div>

              {/* Exercise Sections */}
              {phaseConfig.map((phase, pi) => {
                const phaseItems = filtered.filter((e) => e.phase === phase.key);
                if (phaseItems.length === 0) return null;
                const PhaseIcon = phase.icon;
                return (
                  <motion.div
                    key={phase.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + pi * 0.1 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="stat-icon-box bg-gray-100">
                        <PhaseIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{t(phase.tKey)}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phaseItems.map((ex, i) => {
                        const isDone = completed.has(ex.id);
                        return (
                          <motion.div
                            key={ex.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                            onClick={() => setSelectedEx(ex)}
                            className={`card-white cursor-pointer overflow-hidden group transition-all ${
                              isDone ? "opacity-60 ring-2 ring-primary/30" : ""
                            }`}
                          >
                            {/* Image */}
                            <div className="relative h-44 overflow-hidden bg-gray-50">
                              <img
                                src={ex.image}
                                alt={t(ex.nameKey)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isDone && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-6 w-6 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                              <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                ex.difficulty === "easy"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}>
                                {t(ex.difficulty === "easy" ? "ex.easy" : "ex.medium")}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h4 className="font-bold text-sm text-gray-900 mb-1">{t(ex.nameKey)}</h4>
                              <p className="text-xs text-gray-400 mb-3 line-clamp-2">{t(ex.descKey)}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {ex.duration} {t("ex.sec")}
                                  </span>
                                  {ex.reps && (
                                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                      <RotateCcw className="h-3 w-3" /> {ex.reps} {t("ex.reps")}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-lg border border-gray-100">
                                  {t(ex.muscleKey)}
                                </span>
                              </div>
                            </div>
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

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedEx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setSelectedEx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-100 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden rounded-t-2xl bg-gray-50">
                <img src={selectedEx.image} alt={t(selectedEx.nameKey)} className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedEx(null)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
                <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                  selectedEx.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {t(selectedEx.difficulty === "easy" ? "ex.easy" : "ex.medium")}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t(selectedEx.nameKey)}</h3>
                <p className="text-sm text-gray-500 mb-4">{t(selectedEx.descKey)}</p>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Clock className="h-3 w-3" /> {selectedEx.duration} {t("ex.sec")}
                  </span>
                  {selectedEx.reps && (
                    <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <RotateCcw className="h-3 w-3" /> {selectedEx.reps} {t("ex.reps")}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Target className="h-3 w-3" /> {t(selectedEx.muscleKey)}
                  </span>
                </div>

                {/* Steps */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("ex.steps")}</h4>
                  <div className="space-y-2">
                    {selectedEx.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Timer</h4>
                  <WorkoutTimer
                    totalSeconds={selectedEx.durationVal}
                    onComplete={() => markDone(selectedEx.id)}
                  />
                  {completed.has(selectedEx.id) && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-semibold text-green-600 mt-3 flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Completed!
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarProvider>
  );
};

export default Exercises;
