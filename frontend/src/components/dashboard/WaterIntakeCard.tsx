import { motion } from "framer-motion";
import { Plus, Droplets, GlassWater } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WaterIntakeCardProps {
  glassesCount?: number;
  dailyGoal?: number;
  onAdd?: () => void;
}

export function WaterIntakeCard({ glassesCount = 0, dailyGoal = 8, onAdd }: WaterIntakeCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card-white p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="stat-icon-box bg-gray-100">
            <Droplets className="h-5 w-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t("water.title")}</h3>
        </div>
        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">{glassesCount}/{dailyGoal}</span>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {Array.from({ length: dailyGoal }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className={`w-9 h-11 rounded-lg flex items-center justify-center transition-all border ${
              i < glassesCount
                ? "bg-primary/10 border-primary/30"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <GlassWater className={`h-4 w-4 ${i < glassesCount ? "text-primary" : "text-gray-300"}`} />
          </motion.div>
        ))}
      </div>

      <button
        onClick={onAdd}
        disabled={glassesCount >= dailyGoal}
        className="elder-btn w-full bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        <Plus className="h-5 w-5" />
        {t("water.add")}
      </button>
    </motion.div>
  );
}
