import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { BottomNav } from "@/components/BottomNav";
import { VoiceButton } from "@/components/VoiceButton";
import { HeroCard } from "@/components/dashboard/HeroCard";
import { MedicineScheduleCard } from "@/components/dashboard/MedicineScheduleCard";
import { StreakTrackerCard } from "@/components/dashboard/StreakTrackerCard";
import { WaterIntakeCard } from "@/components/dashboard/WaterIntakeCard";
import { AISuggestionsCard } from "@/components/dashboard/AISuggestionsCard";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDashboard } from "@/hooks/useDashboard";
import { useWater } from "@/hooks/useWater";
import { medicinesService } from "@/services/medicines";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data, isLoading, refetch } = useDashboard();
  const { data: waterData, addGlass } = useWater();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dash.greeting.morning");
    if (hour < 17) return t("dash.greeting.afternoon");
    return t("dash.greeting.evening");
  };

  const userName = data?.user?.name || user?.name || "User";

  const handleTakeDose = async (medId: number, doseId: number) => {
    try {
      await medicinesService.takeDose(medId, doseId);
      refetch();
    } catch {
      // silent
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavbar />
            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 md:mb-8 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-48"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="card-white p-6 animate-pulse">
                      <div className="h-32 bg-gray-100 rounded"></div>
                    </div>
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />

          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                  {getGreeting()}, {userName} 👋
                </h1>
                <p className="text-gray-500 mt-1">{t("dash.subtitle")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                <HeroCard
                  nextMedicine={data?.next_medicine}
                  waterData={waterData}
                  activityToday={data?.activity_today}
                />
                <MedicineScheduleCard
                  medicines={data?.medicines_summary?.list}
                  taken={data?.medicines_summary?.taken}
                  total={data?.medicines_summary?.total}
                  onTake={handleTakeDose}
                />
              <div className="flex flex-col gap-4 md:gap-5">
                <StreakTrackerCard
                  days={data?.streak?.days}
                  goal={data?.streak?.goal}
                />
                <WaterIntakeCard
                  glassesCount={waterData?.glasses_count}
                  dailyGoal={waterData?.daily_goal}
                  onAdd={addGlass}
                />
              </div>
              <AISuggestionsCard tips={data?.ai_tips} />
              <TimelineCard timeline={data?.routine_timeline} />
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

export default Index;
