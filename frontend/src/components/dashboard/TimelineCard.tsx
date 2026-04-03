import { motion } from "framer-motion";
import { Sunrise, Sun, Moon, CalendarDays, Pill, Coffee, Dumbbell, Footprints, BedDouble } from "lucide-react";

const routineItems = [
  { time: "6:00 AM", label: "Wake Up", icon: Sunrise, active: true, period: "morning" },
  { time: "6:30 AM", label: "Morning Walk", icon: Footprints, active: true, period: "morning" },
  { time: "8:00 AM", label: "Breakfast + Meds", icon: Pill, active: true, period: "morning" },
  { time: "12:30 PM", label: "Lunch", icon: Coffee, active: false, period: "afternoon" },
  { time: "2:30 PM", label: "Afternoon Meds", icon: Pill, current: true, active: false, period: "afternoon" },
  { time: "5:00 PM", label: "Light Exercise", icon: Dumbbell, active: false, period: "afternoon" },
  { time: "9:00 PM", label: "Night Meds", icon: Pill, active: false, period: "night" },
  { time: "10:00 PM", label: "Sleep", icon: BedDouble, active: false, period: "night" },
];

export function TimelineCard() {
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
        <h3 className="text-lg font-bold text-gray-900">Daily Routine</h3>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2.5 min-w-max">
          {routineItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.06 }}
              whileHover={{ scale: 1.04, y: -3 }}
              className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] transition-all cursor-default border ${
                item.current
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-primary/30"
                  : item.active
                  ? "bg-gray-50 border-gray-100"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                item.current
                  ? "bg-black/10"
                  : item.active
                  ? "bg-white"
                  : "bg-gray-50"
              }`}>
                <item.icon className={`h-4 w-4 ${
                  item.current ? "text-primary-foreground" : item.active ? "text-gray-700" : "text-gray-400"
                }`} />
              </div>
              <p className={`text-[11px] font-semibold ${item.current ? "" : "text-gray-400"}`}>
                {item.time}
              </p>
              <p className={`text-xs font-medium mt-1 text-center ${item.current ? "" : "text-gray-700"}`}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
