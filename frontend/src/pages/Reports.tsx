import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import { TrendingUp, CalendarDays, Pill, Droplets, BarChart3, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReports } from "@/hooks/useReports";

const adherenceConfig: ChartConfig = {
  taken: { label: "Taken", color: "hsl(72, 100%, 50%)" },
  missed: { label: "Missed", color: "hsl(0, 0%, 80%)" },
};

const waterConfig: ChartConfig = {
  glasses: { label: "Glasses", color: "hsl(72, 100%, 50%)" },
};

const COLORS = [
  "hsl(72, 100%, 50%)", "hsl(0, 0%, 25%)", "hsl(0, 0%, 60%)", "hsl(0, 0%, 80%)",
  "hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)",
];

const Reports = () => {
  const { t } = useLanguage();
  const { summary, weeklyAdherence, waterTrend, medicineCategories, monthlySummary, isLoading } = useReports();

  const statCards = [
    { label: t("reports.stat1"), value: summary ? `${summary.adherence_rate}%` : "--", icon: TrendingUp },
    { label: t("reports.stat2"), value: summary ? `${summary.current_streak} days` : "--", icon: CalendarDays },
    { label: t("reports.stat3"), value: summary?.medicines_today || "--", icon: Pill },
    { label: t("reports.stat4"), value: summary ? `${summary.avg_water_per_day}` : "--", icon: Droplets },
  ];

  const catData = (medicineCategories || []).map((c: any, i: number) => ({
    name: c.category,
    value: c.count,
    fill: COLORS[i % COLORS.length],
  }));

  const monthlyItems = monthlySummary ? [
    { label: t("reports.medsTaken"), value: `${monthlySummary.medicines_taken?.value || 0}/${monthlySummary.medicines_taken?.total || 0}`, pct: monthlySummary.medicines_taken?.total ? Math.round((monthlySummary.medicines_taken.value / monthlySummary.medicines_taken.total) * 100) : 0 },
    { label: t("reports.waterGoal"), value: `${monthlySummary.water_goal_met?.value || 0}/${monthlySummary.water_goal_met?.total || 30} days`, pct: monthlySummary.water_goal_met?.total ? Math.round((monthlySummary.water_goal_met.value / monthlySummary.water_goal_met.total) * 100) : 0 },
    { label: t("reports.routineFollow"), value: `${monthlySummary.routine_followed?.value || 0}/${monthlySummary.routine_followed?.total || 30} days`, pct: monthlySummary.routine_followed?.total ? Math.round((monthlySummary.routine_followed.value / monthlySummary.routine_followed.total) * 100) : 0 },
    { label: t("reports.docVisit"), value: `${monthlySummary.doctor_visits?.value || 0} completed`, pct: 100 },
  ] : [
    { label: t("reports.medsTaken"), value: "0/0", pct: 0 },
    { label: t("reports.waterGoal"), value: "0/30 days", pct: 0 },
    { label: t("reports.routineFollow"), value: "0/30 days", pct: 0 },
    { label: t("reports.docVisit"), value: "0 completed", pct: 0 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="stat-icon-box bg-gray-100">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="elder-heading">{t("reports.title")}</h2>
                </div>
                <p className="text-gray-500 text-sm">{t("reports.desc")}</p>
              </motion.div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {statCards.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -2 }} className="card-white p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="stat-icon-box bg-gray-100">
                        <stat.icon className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{isLoading ? "…" : stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {/* Weekly Adherence */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-white-hover p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="stat-icon-box bg-gray-100">
                      <Activity className="h-4 w-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{t("reports.weekly")}</h3>
                  </div>
                  <ChartContainer config={adherenceConfig} className="h-[250px] w-full">
                    <BarChart data={weeklyAdherence}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="taken" fill="var(--color-taken)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="missed" fill="var(--color-missed)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </motion.div>

                {/* Water Intake Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-white-hover p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="stat-icon-box bg-gray-100">
                      <Droplets className="h-4 w-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{t("reports.water")}</h3>
                  </div>
                  <ChartContainer config={waterConfig} className="h-[250px] w-full">
                    <LineChart data={waterTrend}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="glasses" stroke="var(--color-glasses)" strokeWidth={3} dot={{ fill: "var(--color-glasses)", r: 5 }} />
                    </LineChart>
                  </ChartContainer>
                </motion.div>

                {/* Medicine Categories */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-white-hover p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="stat-icon-box bg-gray-100">
                      <Pill className="h-4 w-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{t("reports.cats")}</h3>
                  </div>
                  <div className="h-[250px] flex items-center justify-center">
                    {catData.length > 0 ? (
                      <PieChart width={220} height={220}>
                        <Pie data={catData} cx={110} cy={110} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                          {catData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : (
                      <p className="text-sm text-gray-400">No medicines yet</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {catData.map((c: any) => (
                      <div key={c.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.fill }} />
                        <span className="text-gray-500">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Monthly Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card-white-hover p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="stat-icon-box bg-gray-100">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{t("reports.summary")}</h3>
                  </div>
                  <div className="space-y-4">
                    {monthlyItems.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-700">{item.label}</span>
                          <span className="text-xs text-gray-400">{item.value}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-primary rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
        <VoiceButton />
      </div>
    </SidebarProvider>
  );
};

export default Reports;
