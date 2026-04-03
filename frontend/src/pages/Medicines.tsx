import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import { Check, AlarmClock, Plus, Search, Pill } from "lucide-react";
import { useState } from "react";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  status: "pending" | "taken" | "missed";
  category: string;
}

const initialMeds: Medicine[] = [
  { id: 1, name: "Metformin", dosage: "500mg", time: "8:00 AM", frequency: "Daily", status: "taken", category: "Diabetes" },
  { id: 2, name: "Amlodipine", dosage: "5mg", time: "2:30 PM", frequency: "Daily", status: "pending", category: "Blood Pressure" },
  { id: 3, name: "Vitamin D3", dosage: "1000 IU", time: "9:00 PM", frequency: "Daily", status: "pending", category: "Supplement" },
  { id: 4, name: "Calcium", dosage: "500mg", time: "9:00 PM", frequency: "Daily", status: "missed", category: "Supplement" },
  { id: 5, name: "Aspirin", dosage: "75mg", time: "8:00 AM", frequency: "Daily", status: "taken", category: "Heart" },
  { id: 6, name: "Omeprazole", dosage: "20mg", time: "7:30 AM", frequency: "Daily", status: "taken", category: "Gastric" },
];

const Medicines = () => {
  const [meds, setMeds] = useState(initialMeds);
  const [filter, setFilter] = useState<"all" | "pending" | "taken" | "missed">("all");
  const [search, setSearch] = useState("");

  const markTaken = (id: number) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, status: "taken" as const } : m)));
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h2 className="elder-heading mb-2">💊 Medicines</h2>
                <p className="text-muted-foreground">Manage your daily medications</p>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{taken}</p>
                  <p className="text-sm text-muted-foreground">Taken</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{missed}</p>
                  <p className="text-sm text-muted-foreground">Missed</p>
                </motion.div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "pending", "taken", "missed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        filter === f ? "neon-highlight neon-glow" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicine List */}
              <div className="space-y-3">
                {filtered.map((med, i) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`glass-card-hover p-5 flex items-center justify-between ${
                      med.status === "taken"
                        ? "border-l-4 border-l-primary"
                        : med.status === "missed"
                        ? "border-l-4 border-l-destructive"
                        : "border-l-4 border-l-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Pill className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className={`font-semibold text-lg ${med.status === "taken" ? "line-through opacity-60" : ""}`}>
                          {med.name} <span className="text-muted-foreground font-normal text-base">{med.dosage}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">{med.time}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{med.category}</span>
                        </div>
                      </div>
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
                          <button className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                            <AlarmClock className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </>
                      )}
                      {med.status === "taken" && (
                        <span className="text-sm font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/10">✅ Done</span>
                      )}
                      {med.status === "missed" && (
                        <span className="text-sm font-medium text-destructive px-3 py-1.5 rounded-lg bg-destructive/10">❌ Missed</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-2xl neon-highlight neon-glow flex items-center justify-center shadow-xl active:scale-90 transition-transform z-40"
              >
                <Plus className="h-7 w-7" />
              </motion.button>
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
