import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { Brain, Heart, ArrowLeft, Pill, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useMedicines } from "@/hooks/useMedicines";
import { OrganVisualizer } from "@/components/OrganVisualizer";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

// ── mock organ logic ────────────────────────────────────────────
const defaultMedicineOrganData: Record<string, { targetOrgans: string[], riskOrgans: string[] }> = {
  "Paracetamol": { targetOrgans: ["Brain", "Nerves"], riskOrgans: ["Liver"] },
  "Aspirin": { targetOrgans: ["Heart", "Blood"], riskOrgans: ["Stomach", "Kidneys"] },
  "Ibuprofen": { targetOrgans: ["Bone"], riskOrgans: ["Stomach", "Heart"] },
  "Metformin": { targetOrgans: ["Liver", "Blood"], riskOrgans: ["Kidneys", "Stomach"] },
  "Lisinopril": { targetOrgans: ["Heart", "Blood"], riskOrgans: ["Kidneys", "Lungs"] },
};

function getOrganDataForMedicine(medicineName: string) {
  const name = medicineName.toLowerCase();
  if (name.includes("paracetamol") || name.includes("dolo") || name.includes("crocin")) return defaultMedicineOrganData["Paracetamol"];
  if (name.includes("aspirin") || name.includes("ecosprin")) return defaultMedicineOrganData["Aspirin"];
  if (name.includes("ibuprofen") || name.includes("advil")) return defaultMedicineOrganData["Ibuprofen"];
  if (name.includes("metformin") || name.includes("glycomet")) return defaultMedicineOrganData["Metformin"];
  if (name.includes("lisinopril")) return defaultMedicineOrganData["Lisinopril"];
  
  return { targetOrgans: ["Blood"], riskOrgans: ["Liver"] };
}

const HealthRisk3D = () => {
  const { medicines: medicinesList } = useMedicines();
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);

  const selectedMed = medicinesList.find((m: any) => m.id === selectedMedId);
  const organData = selectedMed ? getOrganDataForMedicine(selectedMed.name) : { targetOrgans: [], riskOrgans: [] };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f4f3ef]"> {/* Light aesthetic background */}
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-hidden flex flex-col h-[calc(100vh-80px)]">
            
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <NavLink to="/health-risk" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Health Risk
              </NavLink>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Pill className="h-4 w-4 text-[#a3d82a]" />
                <span className="text-sm font-bold text-gray-800">AyuSync</span>
                <span className="text-xs font-semibold text-gray-400">— 3D Drug Visualizer</span>
              </div>
            </div>

            {/* Main Interactive Board */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
              
              {/* LEFT COLUMN: Data & Stats */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 overflow-y-auto pr-1">
                <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-sm flex items-center justify-between">
                  <div className="flex-1 text-center py-2 bg-[#f8faeb] rounded-2xl text-[#6a871d] font-bold text-xs uppercase tracking-wide">Overview</div>
                  <div className="flex-1 text-center py-2 text-gray-400 font-semibold text-xs transition-colors hover:text-gray-600 cursor-pointer">Clinical Data</div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex-1 flex flex-col items-center justify-center text-center">
                  {!selectedMed ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#f8faeb] flex items-center justify-center mb-4">
                        <Pill className="h-8 w-8 text-[#a3d82a]" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Medicine Analyzed</h3>
                      <p className="text-sm text-gray-400">Select a tracked medicine from the right panel to analyze its biological impact.</p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full">
                      <div className="w-16 h-16 rounded-2xl bg-[#a3d82a]/20 flex items-center justify-center mb-4">
                        <Pill className="h-8 w-8 text-[#6a871d]" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{selectedMed.name}</h3>
                      <p className="text-sm font-semibold text-gray-400 mb-6">{selectedMed.dosage} · {selectedMed.category || "General"}</p>
                      
                      <div className="w-full space-y-3">
                        <div className="bg-green-50 rounded-2xl p-4 text-left border border-green-100">
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Target Regions</p>
                          <p className="text-sm font-semibold text-green-900">{organData.targetOrgans.join(", ")}</p>
                        </div>
                        <div className="bg-red-50 rounded-2xl p-4 text-left border border-red-100">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldAlert className="h-3 w-3" /> Potential Side Effects</p>
                          <p className="text-sm font-semibold text-red-900">{organData.riskOrgans.join(", ")}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN: 3D Canvas */}
              <div className="lg:col-span-6 bg-[#0a0a0f] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col min-h-[400px]">
                <div className="absolute inset-0 z-0">
                  <OrganVisualizer targetOrganNames={organData.targetOrgans} riskOrganNames={organData.riskOrgans} />
                </div>
              </div>

              {/* RIGHT COLUMN: Selection & Tools */}
              <div className="lg:col-span-3 flex flex-col gap-5 overflow-y-auto pl-1">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-[#a3d82a]" /> Analyze Medicine
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-5">
                    Select an active medicine from your AyuSync routine to predict toxicity and organ impact.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {medicinesList.length > 0 ? (
                      medicinesList.map((med: any) => (
                        <button
                          key={med.id}
                          onClick={() => setSelectedMedId(selectedMedId === med.id ? null : med.id)}
                          className={cn(
                            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                            selectedMedId === med.id
                              ? "bg-[#a3d82a] text-black border-[#a3d82a] shadow-md shadow-[#a3d82a]/20"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {med.name}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl w-full border border-gray-100">No active medicines found in your routine.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
};

export default HealthRisk3D;
