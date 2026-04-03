import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Pill, Droplets } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const weeklyAdherence = [
  { day: "Mon", taken: 4, missed: 0 },
  { day: "Tue", taken: 3, missed: 1 },
  { day: "Wed", taken: 4, missed: 0 },
  { day: "Thu", taken: 2, missed: 2 },
  { day: "Fri", taken: 4, missed: 0 },
  { day: "Sat", taken: 3, missed: 1 },
  { day: "Sun", taken: 4, missed: 0 },
];

const waterData = [
  { day: "Mon", glasses: 7 },
  { day: "Tue", glasses: 5 },
  { day: "Wed", glasses: 8 },
  { day: "Thu", glasses: 6 },
  { day: "Fri", glasses: 8 },
  { day: "Sat", glasses: 4 },
  { day: "Sun", glasses: 7 },
];

const categoryData = [
  { name: "Diabetes", value: 30, fill: "hsl(var(--primary))" },
  { name: "BP", value: 25, fill: "hsl(var(--foreground))" },
  { name: "Supplements", value: 30, fill: "hsl(var(--muted-foreground))" },
  { name: "Heart", value: 15, fill: "hsl(var(--border))" },
];

const adherenceConfig: ChartConfig = {
  taken: { label: "Taken", color: "hsl(var(--primary))" },
  missed: { label: "Missed", color: "hsl(var(--destructive))" },
};

const waterConfig: ChartConfig = {
  glasses: { label: "Glasses", color: "hsl(var(--primary))" },
};

const Reports = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h2 className="elder-heading mb-2">📊 Reports & Analytics</h2>
                <p className="text-muted-foreground">Track your health progress over time</p>
              </motion.div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Adherence Rate", value: "92%", icon: TrendingUp },
                  { label: "Current Streak", value: "12 days", icon: Calendar },
                  { label: "Medicines Today", value: "4/6", icon: Pill },
                  { label: "Avg Water/Day", value: "6.4 glasses", icon: Droplets },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Weekly Adherence */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-hover p-6">
                  <h3 className="text-lg font-bold mb-4">Weekly Medicine Adherence</h3>
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-hover p-6">
                  <h3 className="text-lg font-bold mb-4">Water Intake Trend</h3>
                  <ChartContainer config={waterConfig} className="h-[250px] w-full">
                    <LineChart data={waterData}>
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="glasses" stroke="var(--color-glasses)" strokeWidth={3} dot={{ fill: "var(--color-glasses)", r: 5 }} />
                    </LineChart>
                  </ChartContainer>
                </motion.div>

                {/* Medicine Categories */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-hover p-6">
                  <h3 className="text-lg font-bold mb-4">Medicine Categories</h3>
                  <div className="h-[250px] flex items-center justify-center">
                    <PieChart width={220} height={220}>
                      <Pie data={categoryData} cx={110} cy={110} innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {categoryData.map((c) => (
                      <div key={c.name} className="flex items-center gap-1.5 text-sm">
                        <div className="w-3 h-3 rounded-sm" style={{ background: c.fill }} />
                        <span className="text-muted-foreground">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Monthly Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card-hover p-6">
                  <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Medicines Taken", value: "168/180", pct: 93 },
                      { label: "Water Goal Met", value: "22/30 days", pct: 73 },
                      { label: "Routine Followed", value: "25/30 days", pct: 83 },
                      { label: "Doctor Visits", value: "2 completed", pct: 100 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="h-full bg-primary rounded-full"
                          />
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
