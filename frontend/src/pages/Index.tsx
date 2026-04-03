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

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar />

          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <HeroCard />
              <MedicineScheduleCard />
              <div className="flex flex-col gap-4 md:gap-6">
                <StreakTrackerCard />
                <WaterIntakeCard />
              </div>
              <AISuggestionsCard />
              <TimelineCard />
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
