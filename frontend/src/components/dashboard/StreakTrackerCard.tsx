import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakTrackerCardProps {
  days?: number;
  goal?: number;
}

export function StreakTrackerCard({ days = 0, goal = 30 }: StreakTrackerCardProps) {
  const { t } = useLanguage();
  const percentage = goal > 0 ? (days / goal) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const time = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(time);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-white p-6 flex flex-col items-center text-center"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="stat-icon-box bg-gray-100">
          <Flame className="h-5 w-5 text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t("streak.title")}</h3>
      </div>

      <div className="relative w-28 h-28 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" className="stroke-gray-100" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            className="stroke-primary" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{days}</span>
          <span className="text-[11px] text-gray-400 font-medium">{t("streak.days")}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Target className="h-3.5 w-3.5" />
        <span>{Math.max(goal - days, 0)} {t("streak.toGoal")}</span>
      </div>
    </motion.div>
  );
}
