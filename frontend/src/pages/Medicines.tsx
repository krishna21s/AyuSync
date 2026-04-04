import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, AlarmClock, Plus, Search, Pill, X, Clock,
  Repeat, Tag, Sunrise, Sun, Moon, ScanLine, Camera, Upload
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMedicines } from "@/hooks/useMedicines";
import { medicinesService } from "@/services/medicines";
import { prescriptionService } from "@/services/prescription";

type Period = "morning" | "afternoon" | "evening";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  period: Period;
  frequency: string;
  status: "pending" | "taken" | "missed";
  category: string;
}

const periodConfig = {
  morning: { labelKey: "period.morning", tKey: "period.mrange", icon: Sunrise },
  afternoon: { labelKey: "period.afternoon", tKey: "period.arange", icon: Sun },
  evening: { labelKey: "period.evening", tKey: "period.erange", icon: Moon },
};

// Medicines are now fetched from backend via useMedicines hook

const Medicines = () => {
  const { t } = useLanguage();
  const { medicines: rawMeds, summary, isLoading: medsLoading, refetch } = useMedicines();

  // Map backend medicine data to local Medicine interface
  const [meds, setMeds] = useState<Medicine[]>([]);
  useEffect(() => {
    if (rawMeds && rawMeds.length > 0) {
      const mapped = rawMeds.map((m: any) => {
        const hour = parseInt((m.scheduled_time || "12:00").split(":")[0]);
        let period: Period = "morning";
        if (hour >= 12 && hour < 17) period = "afternoon";
        else if (hour >= 17) period = "evening";
        return {
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          period,
          frequency: m.frequency || "Daily",
          status: (m.today_status || "pending") as "pending" | "taken" | "missed",
          category: m.category || "General",
        };
      });
      setMeds(mapped);
    }
  }, [rawMeds]);

  const [filter, setFilter] = useState<"all" | "pending" | "taken" | "missed">("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", period: "morning" as Period, frequency: "Daily", category: "" });
  const [scannedPreview, setScannedPreview] = useState<string | null>(null);
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markTaken = async (id: number) => {
    // Optimistic update
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status: "taken" as const } : m)));
    try {
      // Find dose log for today — backend medicines/today has this
      const todayRes = await medicinesService.today();
      const items = todayRes?.data?.list || todayRes?.data || [];
      const match = items.find((item: any) => item.medicine?.id === id && item.dose_log);
      if (match?.dose_log?.id) {
        await medicinesService.takeDose(id, match.dose_log.id);
      }
      refetch();
    } catch {
      // revert on error
      refetch();
    }
  };

  const addMedicine = async () => {
    if (!newMed.name || !newMed.dosage) return;
    const timeMap: Record<string, string> = { morning: "08:00", afternoon: "14:00", evening: "21:00" };
    try {
      await medicinesService.create({
        name: newMed.name,
        dosage: newMed.dosage,
        scheduled_time: timeMap[newMed.period] || "08:00",
        category: newMed.category || "General",
        frequency: newMed.frequency.toLowerCase().replace(" ", "_"),
      });
      setNewMed({ name: "", dosage: "", period: "morning", frequency: "Daily", category: "" });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      console.error("Failed to add medicine:", err);
    }
  };

  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScannedFile(file);
      setScanResult([]);
      setScanError(null);
      // Show image preview
      const reader = new FileReader();
      reader.onload = (ev) => setScannedPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      // Immediately start OCR scan
      runOCR(file);
    }
  };

  const runOCR = async (file: File) => {
    setScanLoading(true);
    setScanError(null);
    try {
      const res = await prescriptionService.scan(file);
      setScanResult(res.data?.medicines || []);
    } catch (err: any) {
      setScanError(err.message || "Failed to scan prescription");
    } finally {
      setScanLoading(false);
    }
  };

  const timingToTime: Record<string, string> = {
    morning: "08:00", afternoon: "14:00", evening: "18:00", night: "21:00",
    morning_evening: "08:00",
  };
  const timingToPeriod = (timing: string): "morning" | "afternoon" | "evening" => {
    if (timing === "morning" || timing === "morning_evening") return "morning";
    if (timing === "afternoon") return "afternoon";
    return "evening";
  };

  const handleScanConfirm = async () => {
    // Add all detected medicines to the backend
    for (const med of scanResult) {
      try {
        await medicinesService.create({
          name: med.name,
          dosage: med.dosage || "As prescribed",
          scheduled_time: timingToTime[med.timing] || "08:00",
          category: med.category || "General",
          frequency: (med.frequency || "daily").toLowerCase().replace(" ", "_"),
        });
      } catch (err) {
        console.error("Failed to add scanned med:", med.name, err);
      }
    }
    setScanResult([]);
    setScannedPreview(null);
    setScannedFile(null);
    setShowScanModal(false);
    refetch();
  };

  const filtered = meds.filter((m) => {
    const matchFilter = filter === "all" || m.status === filter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const taken = meds.filter((m) => m.status === "taken").length;
  const pending = meds.filter((m) => m.status === "pending").length;
  const missed = meds.filter((m) => m.status === "missed").length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="stat-icon-box bg-gray-100">
                        <Pill className="h-5 w-5 text-gray-600" />
                      </div>
                      <h2 className="elder-heading">{t("medsPage.title")}</h2>
                    </div>
                    <p className="text-gray-500 text-sm">{t("medsPage.desc")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowScanModal(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <ScanLine className="h-4 w-4" /> {t("medsPage.scan")}
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" /> {t("medsPage.add")}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{taken}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><Check className="h-3 w-3 text-green-500" /> {t("common.taken")}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{pending}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><Clock className="h-3 w-3 text-orange-500" /> {t("common.pending")}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{missed}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><X className="h-3 w-3 text-red-500" /> {t("common.missed")}</p>
                </motion.div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("medsPage.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
                  />
                </div>
                <div className="flex gap-1.5">
                  {(["all", "pending", "taken", "missed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                        filter === f
                          ? "bg-gray-900 text-white"
                          : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {f === "all" ? t("medsPage.all") : f === "pending" ? t("common.pending") : f === "taken" ? t("common.taken") : t("common.missed")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-2.5">
                {filtered.map((med, i) => {
                  const PeriodIcon = periodConfig[med.period].icon;
                  return (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                      whileHover={{ x: 3 }}
                      className={`card-white-hover p-4 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          med.status === "taken" ? "bg-green-50" : med.status === "missed" ? "bg-red-50" : "bg-gray-50"
                        }`}>
                          <Pill className={`h-4.5 w-4.5 ${
                            med.status === "taken" ? "text-green-600" : med.status === "missed" ? "text-red-500" : "text-gray-500"
                          }`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${med.status === "taken" ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {med.name} <span className="text-gray-400 font-normal">{med.dosage}</span>
                          </p>
                          <div className="flex items-center gap-2.5 mt-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <PeriodIcon className="h-3 w-3" /> {t(periodConfig[med.period].labelKey)}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                              {med.category}
                            </span>
                          </div>
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
                            <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
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
                  );
                })}
              </div>

              {/* Add Medicine Modal */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
                    onClick={() => setShowAddForm(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 w-full max-w-md"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="stat-icon-box bg-gray-100">
                            <Plus className="h-5 w-5 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{t("addMed.title")}</h3>
                        </div>
                        <button onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Medicine Name */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("addMed.name")}</label>
                          <input
                            type="text"
                            value={newMed.name}
                            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                            placeholder="e.g. Paracetamol"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          />
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("addMed.dosage")}</label>
                          <input
                            type="text"
                            value={newMed.dosage}
                            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                            placeholder="e.g. 500mg"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          />
                        </div>

                        {/* Period Selector */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("addMed.when")}</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["morning", "afternoon", "evening"] as const).map((p) => {
                              const PIcon = periodConfig[p].icon;
                              const selected = newMed.period === p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setNewMed({ ...newMed, period: p })}
                                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition-all text-center ${
                                    selected
                                      ? "border-primary bg-primary/5"
                                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                  }`}
                                >
                                  <PIcon className={`h-5 w-5 ${selected ? "text-gray-900" : "text-gray-400"}`} />
                                  <span className={`text-xs font-semibold ${selected ? "text-gray-900" : "text-gray-500"}`}>
                                    {t(periodConfig[p].labelKey)}
                                  </span>
                                  <span className="text-[10px] text-gray-400">{t(periodConfig[p].tKey)}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">{t("addMed.sysNote")}</p>
                        </div>

                        {/* Frequency & Category */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("addMed.freq")}</label>
                            <select
                              value={newMed.frequency}
                              onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            >
                              <option>Daily</option>
                              <option>Twice Daily</option>
                              <option>Weekly</option>
                              <option>As Needed</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{t("addMed.cat")}</label>
                            <input
                              type="text"
                              value={newMed.category}
                              onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                              placeholder="e.g. Heart"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                          </div>
                        </div>

                        {/* Submit */}
                        <button
                          onClick={addMedicine}
                          disabled={!newMed.name || !newMed.dosage}
                          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
                        >
                          <Plus className="h-4 w-4" /> {t("addMed.addBtn")}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan Prescription Modal */}
              <AnimatePresence>
                {showScanModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
                    onClick={() => { setShowScanModal(false); setScannedPreview(null); }}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 w-full max-w-md"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="stat-icon-box bg-gray-100">
                            <ScanLine className="h-5 w-5 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{t("scan.title")}</h3>
                        </div>
                        <button onClick={() => { setShowScanModal(false); setScannedPreview(null); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      {!scannedPreview ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500 mb-4">{t("scan.desc")}</p>

                          {/* Upload Area */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-700">{t("scan.upload")}</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP up to 4MB</p>
                            </div>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleScanUpload}
                          />

                          {/* Camera option */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98]"
                          >
                            <Camera className="h-4 w-4" /> {t("scan.photo")}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Preview */}
                          <div className="rounded-xl overflow-hidden border border-gray-100">
                            <img src={scannedPreview} alt="Scanned prescription" className="w-full h-48 object-cover" />
                          </div>

                          {/* OCR Results */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              {scanLoading ? "🔍 Scanning prescription…" : t("scan.detected")}
                            </p>

                            {/* Loading spinner */}
                            {scanLoading && (
                              <div className="flex items-center justify-center py-6">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="ml-3 text-sm text-gray-500">AI is reading your prescription…</span>
                              </div>
                            )}

                            {/* Error */}
                            {scanError && !scanLoading && (
                              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                                ⚠️ {scanError}
                                <button onClick={() => scannedFile && runOCR(scannedFile)} className="ml-2 underline font-semibold">Retry</button>
                              </div>
                            )}

                            {/* Real detected medicines */}
                            {!scanLoading && !scanError && scanResult.length > 0 && (
                              <div className="space-y-2">
                                {scanResult.map((med, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                      <Pill className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{med.name} {med.dosage}</p>
                                      <p className="text-xs text-gray-400 capitalize">
                                        {med.timing} · {med.frequency?.replace("_", " ")} {med.duration ? `· ${med.duration}` : ""}
                                      </p>
                                    </div>
                                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* No medicines found */}
                            {!scanLoading && !scanError && scanResult.length === 0 && (
                              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-sm text-orange-700 text-center">
                                No medicines detected. Try a clearer image.
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => { setScannedPreview(null); setScannedFile(null); setScanResult([]); setScanError(null); }}
                              className="py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm active:scale-[0.98] transition-all"
                            >
                              {t("scan.rescan")}
                            </button>
                            <button
                              onClick={handleScanConfirm}
                              disabled={scanLoading || scanResult.length === 0}
                              className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" /> {t("scan.addAll")} ({scanResult.length})
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
};

export default Medicines;
