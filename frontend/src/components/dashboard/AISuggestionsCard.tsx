import { motion } from "framer-motion";
import { Bot, Lightbulb } from "lucide-react";

const suggestions = [
  { text: "Take Metformin after food for better absorption", delay: 0.1 },
  { text: "Go for a 10-min evening walk today", delay: 0.2 },
  { text: "Drink warm water before bed for better sleep", delay: 0.3 },
];

export function AISuggestionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="card-white p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="stat-icon-box bg-gray-100">
          <Bot className="h-5 w-5 text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">AI Tips</h3>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + s.delay }}
            className="flex items-start gap-3 bg-gray-50 rounded-xl rounded-bl-sm px-4 py-3 border border-gray-100"
          >
            <div className="shrink-0 mt-0.5">
              <Lightbulb className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
