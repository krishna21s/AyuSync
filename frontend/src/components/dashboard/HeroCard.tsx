import { motion } from "framer-motion";
import { Clock, Droplets, Footprints, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeroCardProps {
  nextMedicine?: { name: string; dosage: string; time: string } | null;
  waterData?: { glasses_count: number; daily_goal: number };
  activityToday?: string;
}

export function HeroCard({ nextMedicine, waterData, activityToday }: HeroCardProps) {
  const { t } = useLanguage();

  const nextTime = nextMedicine?.time || "--:--";
  const glasses = waterData?.glasses_count ?? 0;
  const goal = waterData?.daily_goal ?? 8;
  const activity = activityToday || t("hero.walk");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-full"
    >
      <div className="card-dark p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium text-white/80">{t("hero.todaysPlan")}</span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-6">
            {t("hero.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-primary rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-primary/20"
            >
              <div className="w-11 h-11 rounded-xl bg-black/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-75 text-primary-foreground">{t("hero.nextMed")}</p>
                <p className="text-xl font-bold text-primary-foreground">{nextTime}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">{t("hero.waterRem")}</p>
                <p className="text-xl font-bold text-white">{glasses} / {goal} {t("hero.glasses")}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Footprints className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">{t("hero.activity")}</p>
                <p className="text-xl font-bold text-white">{activity}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
