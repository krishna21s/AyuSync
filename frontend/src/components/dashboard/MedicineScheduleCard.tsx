import { motion } from "framer-motion";
import { Check, AlarmClock, Pill } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Medicine {
  id: number;
  tKey: string;
  time: string;
  status: "pending" | "taken" | "missed";
}

const initialMeds: Medicine[] = [
  { id: 1, tKey: "mock.metformin", time: "8:00 AM", status: "taken" },
  { id: 2, tKey: "mock.aml", time: "2:30 PM", status: "pending" },
  { id: 3, tKey: "mock.vitd3", time: "9:00 PM", status: "pending" },
  { id: 4, tKey: "mock.calc", time: "9:00 PM", status: "missed" },
];

export function MedicineScheduleCard() {
  const [meds, setMeds] = useState(initialMeds);
  const { t } = useLanguage();

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
      className="card-white p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="stat-icon-box bg-gray-100">
            <Pill className="h-5 w-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t("medCard.title")}</h3>
        </div>
        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
          {meds.filter((m) => m.status === "taken").length}/{meds.length} {t("medCard.taken")}
        </span>
      </div>

      <div className="space-y-2.5">
        {meds.map((med) => (
          <motion.div
            key={med.id}
            whileHover={{ x: 3 }}
            className={`flex items-center justify-between p-3.5 rounded-xl transition-all border ${
              med.status === "taken"
                ? "bg-gray-50 border-gray-100"
                : med.status === "missed"
                ? "bg-red-50/50 border-red-100/50"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                med.status === "taken" ? "bg-green-50" : med.status === "missed" ? "bg-red-50" : "bg-gray-50"
              }`}>
                <Pill className={`h-4 w-4 ${
                  med.status === "taken" ? "text-green-600" : med.status === "missed" ? "text-red-500" : "text-gray-500"
                }`} />
              </div>
              <div>
                <p className={`font-semibold text-sm ${med.status === "taken" ? "line-through text-gray-400" : "text-gray-900"}`}>
                  {t(med.tKey)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{med.time}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {med.status === "pending" && (
                <>
                  <button
                    onClick={() => markTaken(med.id)}
                    className="bg-primary text-primary-foreground px-3.5 py-2 min-h-[40px] text-sm font-semibold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" /> {t("common.taken")}
                  </button>
                  <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <AlarmClock className="h-4 w-4 text-gray-400" />
                  </button>
                </>
              )}
              {med.status === "taken" && (
                <span className="text-xs font-medium text-green-600 px-2.5 py-1.5 rounded-lg bg-green-50 flex items-center gap-1">
                  <Check className="h-3 w-3" /> {t("common.done")}
                </span>
              )}
              {med.status === "missed" && (
                <span className="text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-lg bg-red-50">
                  {t("common.missed")}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
