import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function StreakTrackerCard() {
  const streakDays = 12;
  const maxDays = 30;
  const percentage = (streakDays / maxDays) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card-hover p-6 flex flex-col items-center text-center"
    >
      <h3 className="text-xl font-bold mb-4">🔥 Streak</h3>

      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-primary"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{streakDays}</span>
          <span className="text-xs text-muted-foreground">days</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Keep going! 🎯 {maxDays - streakDays} days to your goal
      </p>
    </motion.div>
  );
}
