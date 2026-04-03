import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const suggestions = [
  { text: "Take Metformin after food for better absorption 🍽️", delay: 0.1 },
  { text: "Go for a 10-min evening walk today 🚶", delay: 0.2 },
  { text: "Drink warm water before bed for better sleep 💤", delay: 0.3 },
];

export function AISuggestionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card-hover p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
          <Bot className="h-5 w-5 text-background" />
        </div>
        <h3 className="text-xl font-bold">🤖 AI Tips</h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + s.delay }}
            className="chat-bubble"
          >
            <p className="text-base">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
