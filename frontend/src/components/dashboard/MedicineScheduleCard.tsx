import { motion } from "framer-motion";
import { Check, AlarmClock } from "lucide-react";
import { useState } from "react";

interface Medicine {
  id: number;
  name: string;
  time: string;
  status: "pending" | "taken" | "missed";
}

const initialMeds: Medicine[] = [
  { id: 1, name: "Metformin 500mg", time: "8:00 AM", status: "taken" },
  { id: 2, name: "Amlodipine 5mg", time: "2:30 PM", status: "pending" },
  { id: 3, name: "Vitamin D3", time: "9:00 PM", status: "pending" },
  { id: 4, name: "Calcium Tablet", time: "9:00 PM", status: "missed" },
];

export function MedicineScheduleCard() {
  const [meds, setMeds] = useState(initialMeds);

  const markTaken = (id: number) => {
    setMeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "taken" as const } : m))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card-hover p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">💊 Medicines</h3>
        <span className="text-sm text-muted-foreground">
          {meds.filter((m) => m.status === "taken").length}/{meds.length} taken
        </span>
      </div>

      <div className="space-y-3">
        {meds.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-4 rounded-xl transition-all ${
              med.status === "taken"
                ? "bg-primary/10 border border-primary/30"
                : med.status === "missed"
                ? "bg-destructive/10 border border-destructive/30"
                : "bg-muted"
            }`}
          >
            <div>
              <p className={`font-semibold text-base ${med.status === "taken" ? "line-through opacity-60" : ""}`}>
                {med.name}
              </p>
              <p className="text-sm text-muted-foreground">{med.time}</p>
            </div>
            <div className="flex gap-2">
              {med.status === "pending" && (
                <>
                  <button
                    onClick={() => markTaken(med.id)}
                    className="elder-btn bg-primary text-primary-foreground px-4 py-2 min-h-[44px] text-base flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Taken
                  </button>
                  <button className="p-2.5 rounded-xl bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors">
                    <AlarmClock className="h-5 w-5 text-muted-foreground" />
                  </button>
                </>
              )}
              {med.status === "taken" && (
                <span className="text-sm font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/10">
                  ✅ Done
                </span>
              )}
              {med.status === "missed" && (
                <span className="text-sm font-medium text-destructive px-3 py-1.5 rounded-lg bg-destructive/10">
                  ❌ Missed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
