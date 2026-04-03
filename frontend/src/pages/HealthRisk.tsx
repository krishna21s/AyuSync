import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, AlertTriangle, ShieldCheck, FlaskConical, Dumbbell,
  Leaf, Utensils, MessageCircle, Sparkles, Bot, RefreshCw,
  Heart, Eye, Bone, Wind, Droplets, Activity, Microscope,
  CheckCircle2, Clock, ChevronRight, Send, Info,
} from "lucide-react";
import { useHealthRisk } from "@/hooks/useHealthRisk";
import type { HealthRisk, FoodPrecaution, ExercisePrecaution, YogaPrecaution, Checkup } from "@/hooks/useHealthRisk";

// ── icon maps ─────────────────────────────────────────────────────────────────

const riskIconMap: Record<string, typeof Heart> = {
  heart: Heart, brain: Brain, kidney: Droplets, liver: Activity,
  bone: Bone, eye: Eye, stomach: Utensils, lung: Wind,
  blood: Droplets, nerve: Brain,
};

const checkupIconMap: Record<string, typeof FlaskConical> = {
  flask: FlaskConical, heart: Heart, scan: Microscope, eye: Eye,
  bone: Bone, blood: Droplets, kidney: Droplets, liver: Activity,
};

const severityConfig = {
  low: { label: "Low Risk", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  medium: { label: "Medium Risk", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  high: { label: "High Risk", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

const urgencyConfig = {
  routine: { label: "Routine", color: "text-green-600", bg: "bg-green-50" },
  soon: { label: "Soon", color: "text-amber-600", bg: "bg-amber-50" },
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-50" },
};

// ── sub-components ────────────────────────────────────────────────────────────

function RiskCard({ risk, index }: { risk: HealthRisk; index: number }) {
  const cfg = severityConfig[risk.severity] || severityConfig.medium;
  const IconComp = riskIconMap[risk.icon] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className={`card-white p-4 border ${cfg.border} flex gap-4 items-start`}
    >
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
        <IconComp className={`h-5 w-5 ${cfg.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-bold text-sm text-gray-900">{risk.title}</h4>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{risk.description}</p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
    </motion.div>
  );
}

function FoodCard({ item, index }: { item: FoodPrecaution; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06 }}
      className={`card-white p-4 flex gap-3 items-start ${item.avoid ? "border border-red-100" : "border border-green-100"}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${item.avoid ? "bg-red-50" : "bg-green-50"}`}>
        {item.avoid ? "🚫" : "✅"}
      </div>
      <div>
        <p className={`text-xs font-bold mb-0.5 ${item.avoid ? "text-red-700" : "text-green-700"}`}>
          {item.avoid ? "Avoid" : "Recommended"}: {item.title}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">{item.tip}</p>
      </div>
    </motion.div>
  );
}

function ExerciseCard({ item, index }: { item: ExercisePrecaution; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07 }}
      className="card-white p-4 flex gap-3 items-start"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Dumbbell className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-sm text-gray-900 mb-1">{item.name}</h5>
        <p className="text-xs text-gray-500 mb-2">{item.benefit}</p>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            <Clock className="h-2.5 w-2.5" /> {item.duration}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            <RefreshCw className="h-2.5 w-2.5" /> {item.frequency}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function YogaCard({ item, index }: { item: YogaPrecaution; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07 }}
      className="card-white p-4 flex gap-3 items-start"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
        <Leaf className="h-4 w-4 text-violet-600" />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-sm text-gray-900 mb-1">{item.name}</h5>
        <p className="text-xs text-gray-500 mb-2">{item.benefit}</p>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <Clock className="h-2.5 w-2.5" /> {item.duration}
        </span>
      </div>
    </motion.div>
  );
}

function CheckupCard({ item, index }: { item: Checkup; index: number }) {
  const IconComp = checkupIconMap[item.icon] || FlaskConical;
  const urgency = urgencyConfig[item.urgency] || urgencyConfig.routine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07 }}
      className="card-white p-4 flex gap-3 items-start"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <IconComp className="h-4 w-4 text-primary-foreground/80" style={{ color: "hsl(72 100% 35%)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h5 className="font-bold text-sm text-gray-900">{item.test}</h5>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${urgency.bg} ${urgency.color}`}>
            {urgency.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{item.reason}</p>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          <RefreshCw className="h-2.5 w-2.5" /> {item.frequency}
        </span>
      </div>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto flex flex-col items-center justify-center">
            <div className="text-center max-w-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Brain className="h-8 w-8 text-primary" style={{ color: "hsl(72 100% 35%)" }} />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analysing Your Health Profile…</h3>
              <p className="text-sm text-gray-500 mb-6">
                AI is reviewing your medicine history to predict risks and personalise recommendations.
              </p>
              <div className="space-y-2">
                {["Scanning medicine data", "Predicting health risks", "Generating precautions", "Recommending checkups"].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ delay: i * 0.4, repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      style={{ backgroundColor: "hsl(72 100% 40%)" }}
                    />
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
}

// ── Empty / Generate state ────────────────────────────────────────────────────

function EmptyState({ onGenerate, isLoading }: { onGenerate: () => void; isLoading: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 shadow-inner">
        <Brain className="h-10 w-10" style={{ color: "hsl(72 100% 35%)" }} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">AI Health Risk Predictor</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed">
        Based on your medicine history, our AI will predict potential health risks and give you personalised precautions and checkup recommendations.
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8 w-full max-w-xs">
        {[
          { icon: AlertTriangle, label: "Risk Analysis", color: "text-amber-600", bg: "bg-amber-50" },
          { icon: ShieldCheck, label: "Precautions", color: "text-green-600", bg: "bg-green-50" },
          { icon: FlaskConical, label: "Checkups", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(({ icon: Icon, label, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-1.5`}>
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-[10px] font-semibold text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onGenerate}
        disabled={isLoading}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm shadow-lg hover:bg-gray-800 transition-all disabled:opacity-60"
      >
        <Sparkles className="h-4 w-4 text-primary" style={{ color: "hsl(72 100% 40%)" }} />
        Generate AI Report
      </motion.button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const HealthRiskPage = () => {
  const { report, isLoading, isSending, error, whatsappResult, generateReport, shareWhatsApp } = useHealthRisk();

  if (isLoading) return <LoadingState />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">

              {/* Page header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="stat-icon-box bg-gray-100">
                      <Brain className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="elder-heading">AI Health Risk Predictor</h2>
                      <p className="text-gray-500 text-sm">Personalised insights from your medicine history</p>
                    </div>
                  </div>
                  {report && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                        onClick={generateReport}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                        onClick={shareWhatsApp}
                        disabled={isSending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-all disabled:opacity-60"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isSending ? "Sending…" : "Share via WhatsApp"}
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* WhatsApp result toast */}
              <AnimatePresence>
                {whatsappResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {whatsappResult}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5"
                  >
                    <Info className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state */}
              {!report ? (
                <EmptyState onGenerate={generateReport} isLoading={isLoading} />
              ) : (
                <div className="space-y-8">

                  {/* Hero banner */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-dark p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-6 w-6 text-primary" style={{ color: "hsl(72 100% 50%)" }} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1 font-semibold">AI Analysis Complete</p>
                        <h3 className="text-lg font-bold text-white mb-1">
                          Report for {report.generated_for}
                        </h3>
                        <p className="text-sm text-white/60">
                          Based on {report.medicine_count} active medicine{report.medicine_count !== 1 ? "s" : ""}. {report.risks.length} health risks identified, {report.checkups.length} checkups recommended.
                        </p>
                      </div>
                    </div>
                    {/* Quick stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { icon: AlertTriangle, label: "Risks Found", value: report.risks.length, highlight: true },
                        { icon: ShieldCheck, label: "Precaution Tips", value: (report.precautions?.food?.length || 0) + (report.precautions?.exercise?.length || 0) + (report.precautions?.yoga?.length || 0), highlight: false },
                        { icon: FlaskConical, label: "Tests Advised", value: report.checkups.length, highlight: false },
                      ].map(({ icon: Icon, label, value, highlight }) => (
                        <div key={label} className={`rounded-xl p-3 text-center ${highlight ? "bg-primary/20" : "bg-white/5"}`}>
                          <Icon className="h-4 w-4 mx-auto mb-1 text-white/60" />
                          <p className="text-xl font-bold text-white">{value}</p>
                          <p className="text-[10px] text-white/40">{label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* ── Section 1: Predicted Risks ── */}
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="stat-icon-box bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Predicted Health Risks</h3>
                        <p className="text-xs text-gray-400">Long-term risks based on your medications</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {report.risks.map((risk, idx) => (
                        <RiskCard key={idx} risk={risk} index={idx} />
                      ))}
                    </div>
                  </motion.section>

                  {/* ── Section 2: Precautions ── */}
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="stat-icon-box bg-green-50">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Precautions & Lifestyle</h3>
                        <p className="text-xs text-gray-400">Actionable steps to reduce your risks</p>
                      </div>
                    </div>

                    {/* Food */}
                    {report.precautions?.food?.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Utensils className="h-3.5 w-3.5 text-gray-400" />
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Food & Diet</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.precautions.food.map((item, idx) => (
                            <FoodCard key={idx} item={item} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exercise */}
                    {report.precautions?.exercise?.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Dumbbell className="h-3.5 w-3.5 text-gray-400" />
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Exercise</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.precautions.exercise.map((item, idx) => (
                            <ExerciseCard key={idx} item={item} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Yoga & Mindfulness */}
                    {report.precautions?.yoga?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="h-3.5 w-3.5 text-gray-400" />
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Yoga & Mindfulness</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.precautions.yoga.map((item, idx) => (
                            <YogaCard key={idx} item={item} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.section>

                  {/* ── Section 3: Recommended Checkups ── */}
                  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="stat-icon-box bg-blue-50">
                        <FlaskConical className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Recommended Medical Tests</h3>
                        <p className="text-xs text-gray-400">Screenings for early detection and prevention</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {report.checkups.map((item, idx) => (
                        <CheckupCard key={idx} item={item} index={idx} />
                      ))}
                    </div>
                  </motion.section>

                  {/* Footer card — share CTA */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="card-white p-5 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-bold text-sm text-gray-900 mb-0.5">Share with Caretaker via WhatsApp</p>
                      <p className="text-xs text-gray-400">Send this full report to yourself and your caretaker instantly.</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                      onClick={shareWhatsApp}
                      disabled={isSending}
                      className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-all disabled:opacity-60 shrink-0"
                    >
                      {isSending ? (
                        <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending…</>
                      ) : (
                        <><Send className="h-3.5 w-3.5" /> Send Now</>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Disclaimer */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="flex items-start gap-2 text-xs text-gray-400 px-2 pb-4"
                  >
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p>
                      This AI-generated report is for informational purposes only. Always consult a qualified healthcare professional before making any medical decisions.
                    </p>
                  </motion.div>

                </div>
              )}
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
};

export default HealthRiskPage;
