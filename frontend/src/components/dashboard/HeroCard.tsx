import { motion } from "framer-motion";
import { Clock, Droplets, Footprints } from "lucide-react";

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-full glass-card overflow-hidden relative"
    >
      <div className="relative p-6 md:p-8">
        <span className="dark-chip mb-4 inline-block">📋 Today's Plan</span>
        <h2 className="elder-heading mb-6">Today's Health Plan</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neon-highlight rounded-2xl p-5 flex items-center gap-4 neon-glow">
            <Clock className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-sm font-medium opacity-80">Next Medicine</p>
              <p className="text-xl font-bold">2:30 PM</p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-5 flex items-center gap-4">
            <Droplets className="h-8 w-8 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Water Reminder</p>
              <p className="text-xl font-bold text-foreground">4 / 8 glasses</p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-5 flex items-center gap-4">
            <Footprints className="h-8 w-8 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Activity</p>
              <p className="text-xl font-bold text-foreground">10 min walk</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
