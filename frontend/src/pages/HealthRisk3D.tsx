import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Pill, Search, ShieldAlert, CheckCircle2,
  Sparkles, Brain, Loader2, Info, Zap, AlertCircle
} from "lucide-react";
import { useMedicines } from "@/hooks/useMedicines";
import { OrganVisualizer } from "@/components/OrganVisualizer";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { healthRiskService, OrganImpactResult } from "@/services/healthRisk";

// ── Types ───────────────────────────────────────────────────────────────────

type AnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: OrganImpactResult }
  | { status: "error"; message: string };

const confidenceBadge: Record<string, { label: string; className: string }> = {
  high:   { label: "High Confidence",   className: "bg-green-500/15 text-green-400 border-green-500/30" },
  medium: { label: "Medium Confidence", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  low:    { label: "Low Confidence",    className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

// ── Component ────────────────────────────────────────────────────────────────

const HealthRisk3D = () => {
  const { medicines: medicinesList } = useMedicines();
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });

  // Per-medicine result cache (medicine id → result)
  const cache = useRef<Map<number, OrganImpactResult>>(new Map());

  const selectedMed = medicinesList.find((m: any) => m.id === selectedMedId);

  const handleSelectMedicine = useCallback(async (med: any) => {
    if (selectedMedId === med.id) {
      // Deselect
      setSelectedMedId(null);
      setAnalysis({ status: "idle" });
      return;
    }

    setSelectedMedId(med.id);

    // Check cache first
    if (cache.current.has(med.id)) {
      setAnalysis({ status: "done", result: cache.current.get(med.id)! });
      return;
    }

    setAnalysis({ status: "loading" });

    try {
      const response = await healthRiskService.getOrganImpact({
        name: med.name,
        dosage: med.dosage,
        category: med.category,
        frequency: med.frequency,
      });

      // API returns { data: OrganImpactResult, ... }
      const result = (response as any).data as OrganImpactResult;
      cache.current.set(med.id, result);
      setAnalysis({ status: "done", result });
    } catch (err: any) {
      setAnalysis({ status: "error", message: err.message || "AI analysis failed" });
    }
  }, [selectedMedId]);

  const organData = analysis.status === "done"
    ? { targetOrgans: analysis.result.targetOrgans, riskOrgans: analysis.result.riskOrgans }
    : { targetOrgans: [], riskOrgans: [] };

  const recommendedSystem = analysis.status === "done"
    ? analysis.result.recommendedSystem
    : undefined;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#f4f3ef]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-hidden flex flex-col h-[calc(100vh-80px)]">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
              <NavLink to="/health-risk" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Health Risk
              </NavLink>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                <Pill className="h-4 w-4 text-[#a3d82a]" />
                <span className="text-sm font-bold text-gray-800">AyuSync</span>
                <span className="text-xs font-semibold text-gray-400">— AI 3D Drug Visualizer</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 ml-1">
                  <Sparkles className="h-2.5 w-2.5" /> Groq AI
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">

              {/* LEFT: Info Panel */}
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-1">
                <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-sm flex items-center justify-between">
                  <div className="flex-1 text-center py-2 bg-[#f8faeb] rounded-2xl text-[#6a871d] font-bold text-xs uppercase tracking-wide">Overview</div>
                  <div className="flex-1 text-center py-2 text-gray-400 font-semibold text-xs">Clinical Data</div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
                  <AnimatePresence mode="wait">

                    {/* Idle */}
                    {!selectedMed && (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#f8faeb] flex items-center justify-center">
                          <Pill className="h-8 w-8 text-[#a3d82a]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Medicine Selected</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Select a medicine from the right panel. Our AI will analyze its pharmacological impact in real-time.</p>
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs font-semibold text-purple-600">
                          <Brain className="h-3.5 w-3.5" /> Powered by Groq LLM
                        </div>
                      </motion.div>
                    )}

                    {/* Loading */}
                    {selectedMed && analysis.status === "loading" && (
                      <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 w-full">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-7 w-7 text-purple-500 animate-spin" />
                          </div>
                        </div>
                        <div className="space-y-2 w-full">
                          <h3 className="text-base font-bold text-gray-900">Analyzing {selectedMed.name}</h3>
                          <p className="text-xs text-gray-400">AI is mapping pharmacological organ interactions…</p>
                        </div>
                        <div className="w-full space-y-2 mt-2">
                          {["Querying Groq LLM…", "Mapping organ targets…", "Detecting side effects…"].map((step, i) => (
                            <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                              className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-2.5">
                              <Loader2 className="h-3 w-3 text-purple-400 animate-spin shrink-0" />
                              {step}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    {selectedMed && analysis.status === "error" && (
                      <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                          <AlertCircle className="h-7 w-7 text-red-400" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Analysis Failed</h3>
                        <p className="text-xs text-red-500">{analysis.message}</p>
                        <button onClick={() => handleSelectMedicine(selectedMed)}
                          className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors">
                          Retry
                        </button>
                      </motion.div>
                    )}

                    {/* Done */}
                    {selectedMed && analysis.status === "done" && (
                      <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full gap-4 text-left">
                        {/* Medicine Header */}
                        <div className="flex flex-col items-center text-center w-full">
                          <div className="w-14 h-14 rounded-2xl bg-[#a3d82a]/20 flex items-center justify-center mb-3">
                            <Pill className="h-7 w-7 text-[#6a871d]" />
                          </div>
                          <h3 className="text-lg font-black text-gray-900">{selectedMed.name}</h3>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">{selectedMed.dosage} · {selectedMed.category || "General"}</p>
                          {/* Confidence Badge */}
                          <span className={cn("mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border", confidenceBadge[analysis.result.confidence]?.className)}>
                            <Zap className="h-2.5 w-2.5" />
                            {confidenceBadge[analysis.result.confidence]?.label}
                          </span>
                        </div>

                        {/* Target Organs */}
                        <div className="w-full bg-green-50 rounded-2xl p-4 border border-green-100">
                          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3" /> Target Regions
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.result.targetOrgans.map(o => (
                              <span key={o} className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg">{o}</span>
                            ))}
                          </div>
                        </div>

                        {/* Risk Organs */}
                        <div className="w-full bg-red-50 rounded-2xl p-4 border border-red-100">
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="h-3 w-3" /> Side Effect Risk
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.result.riskOrgans.map(o => (
                              <span key={o} className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg">{o}</span>
                            ))}
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        {analysis.result.reasoning && (
                          <div className="w-full bg-blue-50 rounded-2xl p-4 border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <Brain className="h-3 w-3" /> AI Analysis
                            </p>
                            <p className="text-xs text-blue-900 leading-relaxed">{analysis.result.reasoning}</p>
                          </div>
                        )}

                        {/* Mechanism */}
                        {analysis.result.mechanismSummary && (
                          <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <Info className="h-3 w-3" /> Mechanism
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">{analysis.result.mechanismSummary}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* CENTER: 3D Canvas */}
              <div className="lg:col-span-6 bg-[#0a0a0f] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col min-h-[400px]">
                <div className="absolute inset-0 z-0">
                  <OrganVisualizer
                    targetOrganNames={organData.targetOrgans}
                    riskOrganNames={organData.riskOrgans}
                    activeSystemOverride={recommendedSystem}
                  />
                </div>

                {/* Loading overlay on the 3D canvas */}
                <AnimatePresence>
                  {analysis.status === "loading" && (
                    <motion.div
                      key="canvas-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 animate-ping absolute inset-0" />
                          <div className="w-16 h-16 rounded-full border-2 border-purple-500/60 flex items-center justify-center relative">
                            <Brain className="h-7 w-7 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-sm font-bold text-white/80">AI Analyzing Pharmacology…</p>
                        <p className="text-xs text-white/40">Groq LLM is mapping organ interactions</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: Medicine Selection */}
              <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-1">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                    <Search className="h-4 w-4 text-[#a3d82a]" /> Analyze Medicine
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-5">
                    Select a medicine — Groq AI will identify organ targets and side effects in real-time.
                  </p>

                  <div className="flex flex-col gap-2">
                    {medicinesList.length > 0 ? (
                      medicinesList.map((med: any) => {
                        const isSelected = selectedMedId === med.id;
                        const isLoading = isSelected && analysis.status === "loading";
                        const isDone = isSelected && analysis.status === "done";
                        const cached = cache.current.has(med.id);

                        return (
                          <button
                            key={med.id}
                            onClick={() => handleSelectMedicine(med)}
                            className={cn(
                              "px-4 py-3 rounded-xl text-left text-xs font-bold transition-all border relative",
                              isSelected
                                ? "bg-[#a3d82a] text-black border-[#a3d82a] shadow-md shadow-[#a3d82a]/20"
                                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="leading-tight">{med.name}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-black/50" />}
                                {isDone && <Sparkles className="h-3.5 w-3.5 text-black/60" />}
                                {!isSelected && cached && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3d82a]" title="Cached result" />
                                )}
                              </div>
                            </div>
                            {isSelected && analysis.status === "done" && (
                              <p className="text-[10px] text-black/50 font-normal mt-0.5 leading-tight">
                                {analysis.result.targetOrgans.join(", ")} → {analysis.result.riskOrgans.join(", ")}
                              </p>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                        No active medicines found in your routine.
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Badge */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-bold text-purple-700">Groq AI Powered</span>
                  </div>
                  <p className="text-[11px] text-purple-600 leading-relaxed">
                    Real-time pharmacological analysis using <strong>Llama 3.1</strong>. Results are cached per session.
                  </p>
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
