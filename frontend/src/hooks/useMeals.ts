import { useState, useEffect, useCallback } from "react";
import { mealsService } from "@/services/meals";

export function useMeals() {
  const [meals, setMeals] = useState<any[]>([]);
  const [nutritionSummary, setNutritionSummary] = useState<any>({});
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [mealsRes, logsRes] = await Promise.all([
        mealsService.list(),
        mealsService.logToday(),
      ]);
      setMeals(mealsRes.data.meals || []);
      setNutritionSummary(mealsRes.data.nutrition_summary || {});
      setTodayLogs(logsRes.data.logs || []);
    } catch (err: any) {
      setError(err.message || "Failed to load meals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const logMeal = useCallback(async (meal_id: number) => {
    try {
      await mealsService.logMeal(meal_id);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const removeLog = useCallback(async (log_id: number) => {
    try {
      await mealsService.removeLog(log_id);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const isLogged = useCallback((meal_id: number) => {
    return todayLogs.some((l: any) => l.meal_id === meal_id);
  }, [todayLogs]);

  return { meals, nutritionSummary, todayLogs, isLoading, error, refetch: fetch, logMeal, removeLog, isLogged };
}
