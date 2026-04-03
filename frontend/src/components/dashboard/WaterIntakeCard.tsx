import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

export function WaterIntakeCard() {
  const [glasses, setGlasses] = useState(4);
  const total = 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card-hover p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">💧 Water Intake</h3>
        <span className="text-sm text-muted-foreground">{glasses}/{total}</span>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className={`w-10 h-12 rounded-xl flex items-center justify-center text-lg transition-all ${
              i < glasses
                ? "bg-accent/20 border-2 border-accent"
                : "bg-muted border-2 border-transparent"
            }`}
          >
            {i < glasses ? "💧" : "○"}
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => setGlasses((g) => Math.min(g + 1, total))}
        disabled={glasses >= total}
        className="elder-btn w-full bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Plus className="h-5 w-5" />
        Add Water
      </button>
    </motion.div>
  );
}
