import { motion } from "framer-motion";

const routineItems = [
  { time: "6:00 AM", label: "Wake Up", icon: "🌅", active: true },
  { time: "6:30 AM", label: "Morning Walk", icon: "🚶", active: true },
  { time: "8:00 AM", label: "Breakfast + Meds", icon: "💊", active: true },
  { time: "12:30 PM", label: "Lunch", icon: "☀️", active: false },
  { time: "2:30 PM", label: "Afternoon Meds", icon: "💊", current: true, active: false },
  { time: "6:00 PM", label: "Evening Walk", icon: "🌆", active: false },
  { time: "9:00 PM", label: "Night Meds", icon: "🌙", active: false },
  { time: "10:00 PM", label: "Sleep", icon: "😴", active: false },
];

export function TimelineCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="col-span-full glass-card-hover p-6"
    >
      <h3 className="text-xl font-bold mb-5">📅 Daily Routine</h3>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {routineItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] transition-all ${
                item.current
                  ? "neon-highlight neon-glow"
                  : item.active
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <span className="text-2xl mb-2">{item.icon}</span>
              <p className={`text-xs font-semibold ${item.current ? "" : "text-muted-foreground"}`}>
                {item.time}
              </p>
              <p className={`text-sm font-medium mt-1 text-center ${item.current ? "" : "text-foreground"}`}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
