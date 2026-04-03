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
import { useState, useRef } from "react";

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
  morning: { label: "Morning", timeRange: "6 AM – 12 PM", icon: Sunrise },
  afternoon: { label: "Afternoon", timeRange: "12 PM – 5 PM", icon: Sun },
  evening: { label: "Evening", timeRange: "5 PM – 10 PM", icon: Moon },
};

const initialMeds: Medicine[] = [
  { id: 1, name: "Metformin", dosage: "500mg", period: "morning", frequency: "Daily", status: "taken", category: "Diabetes" },
  { id: 2, name: "Amlodipine", dosage: "5mg", period: "afternoon", frequency: "Daily", status: "pending", category: "Blood Pressure" },
  { id: 3, name: "Vitamin D3", dosage: "1000 IU", period: "evening", frequency: "Daily", status: "pending", category: "Supplement" },
  { id: 4, name: "Calcium", dosage: "500mg", period: "evening", frequency: "Daily", status: "missed", category: "Supplement" },
  { id: 5, name: "Aspirin", dosage: "75mg", period: "morning", frequency: "Daily", status: "taken", category: "Heart" },
  { id: 6, name: "Omeprazole", dosage: "20mg", period: "morning", frequency: "Daily", status: "taken", category: "Gastric" },
];

const Medicines = () => {
  const [meds, setMeds] = useState(initialMeds);
  const [filter, setFilter] = useState<"all" | "pending" | "taken" | "missed">("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", period: "morning" as Period, frequency: "Daily", category: "" });
  const [scannedPreview, setScannedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markTaken = (id: number) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status: "taken" as const } : m)));
  };

  const addMedicine = () => {
    if (!newMed.name || !newMed.dosage) return;
    const newEntry: Medicine = {
      id: Date.now(),
      name: newMed.name,
      dosage: newMed.dosage,
      period: newMed.period,
      frequency: newMed.frequency,
      status: "pending",
      category: newMed.category || "General",
    };
    setMeds((prev) => [...prev, newEntry]);
    setNewMed({ name: "", dosage: "", period: "morning", frequency: "Daily", category: "" });
    setShowAddForm(false);
  };

  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScannedPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanConfirm = () => {
    // Simulate AI extracting medicine from prescription
    const scannedMeds: Medicine[] = [
      { id: Date.now(), name: "Paracetamol", dosage: "650mg", period: "morning", frequency: "As Needed", status: "pending", category: "Pain Relief" },
      { id: Date.now() + 1, name: "Cetirizine", dosage: "10mg", period: "evening", frequency: "Daily", status: "pending", category: "Allergy" },
    ];
    setMeds((prev) => [...prev, ...scannedMeds]);
    setScannedPreview(null);
    setShowScanModal(false);
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
                      <h2 className="elder-heading">Medicines</h2>
                    </div>
                    <p className="text-gray-500 text-sm">Manage your daily medications</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowScanModal(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <ScanLine className="h-4 w-4" /> Scan Prescription
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-all"
                    >
                      <Plus className="h-4 w-4" /> Add Medicine
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{taken}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><Check className="h-3 w-3 text-green-500" /> Taken</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{pending}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><Clock className="h-3 w-3 text-orange-500" /> Pending</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-white p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{missed}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><X className="h-3 w-3 text-red-500" /> Missed</p>
                </motion.div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
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
                      {f}
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
                              <PeriodIcon className="h-3 w-3" /> {periodConfig[med.period].label}
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
                              <Check className="h-3.5 w-3.5" /> Taken
                            </button>
                            <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                              <AlarmClock className="h-4 w-4 text-gray-400" />
                            </button>
                          </>
                        )}
                        {med.status === "taken" && (
                          <span className="text-xs font-medium text-green-600 px-2.5 py-1.5 rounded-lg bg-green-50 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Done
                          </span>
                        )}
                        {med.status === "missed" && (
                          <span className="text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-lg bg-red-50">
                            Missed
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
                          <h3 className="text-lg font-bold text-gray-900">Add Medicine</h3>
                        </div>
                        <button onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Medicine Name */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Medicine Name</label>
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
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Dosage</label>
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
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">When to Take</label>
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
                                    {periodConfig[p].label}
                                  </span>
                                  <span className="text-[10px] text-gray-400">{periodConfig[p].timeRange}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">Our system will set the exact reminder timing based on your routine.</p>
                        </div>

                        {/* Frequency & Category */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Frequency</label>
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
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
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
                          <Plus className="h-4 w-4" /> Add Medicine
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
                          <h3 className="text-lg font-bold text-gray-900">Scan Prescription</h3>
                        </div>
                        <button onClick={() => { setShowScanModal(false); setScannedPreview(null); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>

                      {!scannedPreview ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500 mb-4">Upload your prescription and our AI will automatically identify medicines and add them to your list.</p>

                          {/* Upload Area */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-700">Upload Prescription</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF up to 10MB</p>
                            </div>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={handleScanUpload}
                          />

                          {/* Camera option */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98]"
                          >
                            <Camera className="h-4 w-4" /> Take Photo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Preview */}
                          <div className="rounded-xl overflow-hidden border border-gray-100">
                            <img src={scannedPreview} alt="Scanned prescription" className="w-full h-48 object-cover" />
                          </div>

                          {/* Simulated detected medicines */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Detected Medicines</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                  <Pill className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Paracetamol 650mg</p>
                                  <p className="text-xs text-gray-400">Morning · As Needed</p>
                                </div>
                                <Check className="h-4 w-4 text-green-500 ml-auto" />
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                  <Pill className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">Cetirizine 10mg</p>
                                  <p className="text-xs text-gray-400">Evening · Daily</p>
                                </div>
                                <Check className="h-4 w-4 text-green-500 ml-auto" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setScannedPreview(null)}
                              className="py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm active:scale-[0.98] transition-all"
                            >
                              Rescan
                            </button>
                            <button
                              onClick={handleScanConfirm}
                              className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                              <Plus className="h-4 w-4" /> Add All
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
