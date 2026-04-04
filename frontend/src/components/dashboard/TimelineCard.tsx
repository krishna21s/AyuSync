import { motion } from "framer-motion";
import { CalendarDays, Check, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineItem {
  name: string;
  scheduled_time: string;
  is_completed: boolean;
}

interface TimelineCardProps {
  timeline?: TimelineItem[];
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  const { t } = useLanguage();

  const items = timeline || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-full card-white p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="stat-icon-box bg-gray-100">
          <CalendarDays className="h-5 w-5 text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t("timeline.title")}</h3>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No routine tasks yet. Add tasks in the Routine page!</p>
      )}

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2.5 min-w-max">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              whileHover={{ scale: 1.04, y: -3 }}
              className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] transition-all cursor-default border ${
                item.is_completed
                  ? "bg-gray-50 border-gray-100"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                item.is_completed ? "bg-primary/10" : "bg-gray-50"
              }`}>
                {item.is_completed ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="text-[11px] font-semibold text-gray-400">
                {item.scheduled_time}
              </p>
              <p className={`text-xs font-medium mt-1 text-center ${item.is_completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                {item.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
