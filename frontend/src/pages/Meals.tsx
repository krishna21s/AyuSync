import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Sparkles, Flame, Beef, Wheat, Leaf,
  Heart, Shield, Zap, Moon, Clock, ChevronRight, Bot
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type MealPeriod = "breakfast" | "lunch" | "snacks" | "dinner";

interface MealItem {
  id: number;
  nameKey: string;
  qtyKey: string;
  image: string;
  kcal: number;
  tags: string[]; // translation keys
  period: MealPeriod;
}

const meals: MealItem[] = [
  { id: 1, nameKey: "ml.idli", qtyKey: "ml.idliQty", image: "/meals/idli-chutney.png", kcal: 250, tags: ["tag.diabetes", "tag.digestion"], period: "breakfast" },
  { id: 2, nameKey: "ml.oats", qtyKey: "ml.oatsQty", image: "/meals/oats-porridge.png", kcal: 180, tags: ["tag.heart", "tag.energy"], period: "breakfast" },
  { id: 3, nameKey: "ml.riceDal", qtyKey: "ml.riceDalQty", image: "/meals/rice-dal.png", kcal: 420, tags: ["tag.diabetes", "tag.energy"], period: "lunch" },
  { id: 4, nameKey: "ml.chapati", qtyKey: "ml.chapatiQty", image: "/meals/chapati-sabzi.png", kcal: 350, tags: ["tag.heart", "tag.bp"], period: "lunch" },
  { id: 5, nameKey: "ml.fruit", qtyKey: "ml.fruitQty", image: "/meals/fruit-bowl.png", kcal: 120, tags: ["tag.immunity", "tag.digestion"], period: "snacks" },
  { id: 6, nameKey: "ml.dryFruits", qtyKey: "ml.dryFruitsQty", image: "/meals/dry-fruits.png", kcal: 160, tags: ["tag.bone", "tag.energy"], period: "snacks" },
  { id: 7, nameKey: "ml.khichdi", qtyKey: "ml.khichdiQty", image: "/meals/khichdi.png", kcal: 320, tags: ["tag.digestion", "tag.bp"], period: "dinner" },
  { id: 8, nameKey: "ml.warmMilk", qtyKey: "ml.warmMilkQty", image: "/meals/warm-milk.png", kcal: 100, tags: ["tag.sleep", "tag.bone"], period: "dinner" },
];

const periodConfig: { key: MealPeriod; tKey: string; time: string; icon: typeof UtensilsCrossed }[] = [
  { key: "breakfast", tKey: "ml.breakfast", time: "7:00 – 8:30 AM", icon: UtensilsCrossed },
  { key: "lunch", tKey: "ml.lunch", time: "12:30 – 1:30 PM", icon: UtensilsCrossed },
  { key: "snacks", tKey: "ml.snacks", time: "4:00 – 5:00 PM", icon: UtensilsCrossed },
  { key: "dinner", tKey: "ml.dinner", time: "7:30 – 8:30 PM", icon: Moon },
];

const tagIcons: Record<string, typeof Heart> = {
  "tag.diabetes": Shield,
  "tag.heart": Heart,
  "tag.bp": Zap,
  "tag.bone": Shield,
  "tag.digestion": Leaf,
  "tag.immunity": Shield,
  "tag.energy": Flame,
  "tag.sleep": Moon,
};

// Nutrition summary data
const nutritionSummary = [
  { key: "ml.calories", value: "1,900", unit: "kcal", pct: 85, color: "bg-primary" },
  { key: "ml.protein", value: "62g", unit: "", pct: 78, color: "bg-gray-700" },
  { key: "ml.carbs", value: "260g", unit: "", pct: 72, color: "bg-gray-400" },
  { key: "ml.fiber", value: "28g", unit: "", pct: 93, color: "bg-green-500" },
];

const Meals = () => {
  const { t } = useLanguage();

  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);

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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-dark p-5 mb-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80 leading-relaxed">{t("ml.banner")}</p>
                    <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {totalKcal} {t("ml.kcal")} · AI-personalized
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Nutrition Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card-white p-5 mb-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="stat-icon-box bg-gray-100">
                    <Flame className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{t("ml.summary")}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {nutritionSummary.map((n) => (
                    <div key={n.key} className="text-center">
                      <p className="text-xl font-bold text-gray-900">{n.value}</p>
                      <p className="text-[11px] text-gray-400 mb-2">{t(n.key)}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${n.pct}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className={`h-full rounded-full ${n.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Meal Periods */}
              {periodConfig.map((period, pi) => {
                const periodMeals = meals.filter((m) => m.period === period.key);
                const PeriodIcon = period.icon;
                return (
                  <motion.div
                    key={period.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + pi * 0.1 }}
                    className="mb-8"
                  >
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
                      {periodMeals.map((meal, i) => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + pi * 0.1 + i * 0.05 }}
                          whileHover={{ y: -3, scale: 1.01 }}
                          className="card-white overflow-hidden flex group cursor-default"
                        >
                          {/* Food Image */}
                          <div className="w-28 sm:w-32 h-full shrink-0 overflow-hidden bg-gray-50">
                            <img
                              src={meal.image}
                              alt={t(meal.nameKey)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-bold text-sm text-gray-900">{t(meal.nameKey)}</h4>
                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 shrink-0 ml-2">
                                  {meal.kcal} {t("ml.kcal")}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2.5">{t(meal.qtyKey)}</p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {meal.tags.map((tagKey) => {
                                const TagIcon = tagIcons[tagKey] || Shield;
                                return (
                                  <span
                                    key={tagKey}
                                    className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"
                                  >
                                    <TagIcon className="h-2.5 w-2.5" />
                                    {t(tagKey)}
                                  </span>
                                );
                              })}
                            </div>
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

export default Meals;
