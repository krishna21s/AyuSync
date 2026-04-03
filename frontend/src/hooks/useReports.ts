import { useState, useEffect, useCallback } from "react";
import { reportsService } from "@/services/reports";

export function useReports() {
  const [summary, setSummary] = useState<any>(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState<any[]>([]);
  const [waterTrend, setWaterTrend] = useState<any[]>([]);
  const [medicineCategories, setMedicineCategories] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [sumRes, weekRes, waterRes, catRes, monthRes] = await Promise.all([
        reportsService.summary(),
        reportsService.weeklyAdherence(),
        reportsService.waterTrend(),
        reportsService.medicineCategories(),
        reportsService.monthlySummary(),
      ]);
      setSummary(sumRes.data);
      setWeeklyAdherence(weekRes.data || []);
      setWaterTrend(waterRes.data || []);
      setMedicineCategories(catRes.data || []);
      setMonthlySummary(monthRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, weeklyAdherence, waterTrend, medicineCategories, monthlySummary, isLoading, error, refetch: fetch };
}
