import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Sparkles, Flame, Leaf,
  Heart, Shield, Zap, Moon, Clock, Bot, Check
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMeals } from "@/hooks/useMeals";
import { useAITips } from "@/hooks/useAITips";

type MealPeriod = "breakfast" | "lunch" | "snacks" | "dinner";

const periodConfig: { key: MealPeriod; tKey: string; time: string; icon: typeof UtensilsCrossed }[] = [
  { key: "breakfast", tKey: "ml.breakfast", time: "7:00 – 8:30 AM", icon: UtensilsCrossed },
  { key: "lunch", tKey: "ml.lunch", time: "12:30 – 1:30 PM", icon: UtensilsCrossed },
  { key: "snacks", tKey: "ml.snacks", time: "4:00 – 5:00 PM", icon: UtensilsCrossed },
  { key: "dinner", tKey: "ml.dinner", time: "7:30 – 8:30 PM", icon: Moon },
];

const tagIcons: Record<string, typeof Heart> = {
  diabetes: Shield, heart: Heart, bp: Zap, bone: Shield,
  digestion: Leaf, immunity: Shield, energy: Flame, sleep: Moon,
};

const Meals = () => {
  const { t } = useLanguage();
  const { meals, nutritionSummary, isLoading, logMeal, isLogged } = useMeals();
  const { tips } = useAITips();

  const totalKcal = nutritionSummary?.total_kcal || meals.reduce((s: number, m: any) => s + (m.kcal || 0), 0);

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavbar />
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto flex flex-col items-center justify-center">
              <div className="text-center animate-pulse">
                <Bot className="h-10 w-10 text-primary mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Generating personalized meals...</h3>
                <p className="text-sm text-gray-500">AI is building your daily menu based on your profile.</p>
              </div>
            </main>
          </div>
          <BottomNav />
          <VoiceButton />
        </div>
      </SidebarProvider>
    );
  }

  const parseTags = (tags: string | null | undefined): string[] => {
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  };

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
                    <UtensilsCrossed className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="elder-heading">{t("ml.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("ml.desc")}</p>
              </motion.div>

              {/* AI Banner */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-dark p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 leading-relaxed">{tips[0] || t("ml.banner")}</p>
                    <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {totalKcal} {t("ml.kcal")} · AI-personalized
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Nutrition Summary */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-white p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="stat-icon-box bg-gray-100">
                    <Flame className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{t("ml.summary")}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "ml.calories", value: `${nutritionSummary?.total_kcal || 0}`, pct: 85, color: "bg-primary" },
                    { key: "ml.protein", value: `${nutritionSummary?.protein_g?.toFixed(0) || 0}g`, pct: 78, color: "bg-gray-700" },
                    { key: "ml.carbs", value: `${nutritionSummary?.carbs_g?.toFixed(0) || 0}g`, pct: 72, color: "bg-gray-400" },
                    { key: "ml.fiber", value: `${nutritionSummary?.fiber_g?.toFixed(0) || 0}g`, pct: 93, color: "bg-green-500" },
                  ].map((n) => (
                    <div key={n.key} className="text-center">
                      <p className="text-xl font-bold text-gray-900">{n.value}</p>
                      <p className="text-[11px] text-gray-400 mb-2">{t(n.key)}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${n.pct}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${n.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Meal Periods */}
              {periodConfig.map((period, pi) => {
                const periodMeals = meals.filter((m: any) => m.meal_period === period.key);
                if (periodMeals.length === 0) return null;
                const PeriodIcon = period.icon;
                return (
                  <motion.div key={period.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + pi * 0.1 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="stat-icon-box bg-gray-100">
                        <PeriodIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{t(period.tKey)}</h3>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {period.time}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {periodMeals.map((meal: any, i: number) => {
                        const logged = isLogged(meal.id);
                        const mealTags = parseTags(meal.tags);
                        return (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + pi * 0.1 + i * 0.05 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            className={`card-white overflow-hidden flex group cursor-default ${logged ? "ring-2 ring-primary/30" : ""}`}
                          >
                            <div className="w-28 sm:w-32 h-full shrink-0 overflow-hidden bg-gray-50 relative">
                              <img src={meal.image_url || "/meals/placeholder.png"} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {logged && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <Check className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-bold text-sm text-gray-900">{meal.name}</h4>
                                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 shrink-0 ml-2">
                                    {meal.kcal} {t("ml.kcal")}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2.5">{meal.description}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1.5">
                                  {mealTags.map((tag: string) => {
                                    const TagIcon = tagIcons[tag] || Shield;
                                    return (
                                      <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                        <TagIcon className="h-2.5 w-2.5" /> {tag}
                                      </span>
                                    );
                                  })}
                                </div>
                                {!logged && (
                                  <button
                                    onClick={() => logMeal(meal.id)}
                                    className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-colors shrink-0 ml-2"
                                  >
                                    Log ✓
                                  </button>
                                )}
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
    </SidebarProvider>
  );
};

export default Meals;
