import { motion } from "framer-motion";
import { Check, AlarmClock, Pill } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MedicineScheduleCardProps {
  medicines?: any[];
  taken?: number;
  total?: number;
  onTake?: (medId: number, doseId: number) => void;
}

export function MedicineScheduleCard({ medicines, taken, total, onTake }: MedicineScheduleCardProps) {
  const { t } = useLanguage();

  const meds = medicines || [];
  const takenCount = taken ?? 0;
  const totalCount = total ?? meds.length;

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
          {takenCount}/{totalCount} {t("medCard.taken")}
        </span>
      </div>

      <div className="space-y-2.5">
        {meds.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No medicines scheduled</p>
        )}
        {meds.map((item: any) => {
          const med = item.medicine;
          const dose = item.dose_log;
          const status = med?.today_status || dose?.status || "upcoming";
          const name = med?.name || "Medicine";
          const time = med?.scheduled_time || "--:--";

          return (
            <motion.div
              key={med?.id || Math.random()}
              whileHover={{ x: 3 }}
              className={`flex items-center justify-between p-3.5 rounded-xl transition-all border ${
                status === "taken" || status === "done"
                  ? "bg-gray-50 border-gray-100"
                  : status === "missed"
                  ? "bg-red-50/50 border-red-100/50"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  status === "taken" || status === "done" ? "bg-green-50" : status === "missed" ? "bg-red-50" : "bg-gray-50"
                }`}>
                  <Pill className={`h-4 w-4 ${
                    status === "taken" || status === "done" ? "text-green-600" : status === "missed" ? "text-red-500" : "text-gray-500"
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${status === "taken" || status === "done" ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {status === "upcoming" && onTake && dose && (
                  <>
                    <button
                      onClick={() => onTake(med.id, dose.id)}
                      className="bg-primary text-primary-foreground px-3.5 py-2 min-h-[40px] text-sm font-semibold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Check className="h-3.5 w-3.5" /> {t("common.taken")}
                    </button>
                    <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <AlarmClock className="h-4 w-4 text-gray-400" />
                    </button>
                  </>
                )}
                {(status === "taken" || status === "done") && (
                  <span className="text-xs font-medium text-green-600 px-2.5 py-1.5 rounded-lg bg-green-50 flex items-center gap-1">
                    <Check className="h-3 w-3" /> {t("common.done")}
                  </span>
                )}
                {status === "missed" && (
                  <span className="text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-lg bg-red-50">
                    {t("common.missed")}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
