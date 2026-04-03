import { useState, useEffect, useCallback } from "react";
import { exercisesService } from "@/services/exercises";

export function useExercises(category?: string) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ completed: 0, total: 0, progress_pct: 0, duration_done: 0, duration_total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [exRes, logsRes, progRes] = await Promise.all([
        exercisesService.list(category),
        exercisesService.logToday(),
        exercisesService.progress(),
      ]);
      setExercises(exRes.data.exercises || []);
      setTodayLogs(logsRes.data.logs || []);
      setProgress(progRes.data || progress);
    } catch (err: any) {
      setError(err.message || "Failed to load exercises");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => { fetch(); }, [fetch]);

  const completeExercise = useCallback(async (exercise_id: number, duration_seconds?: number) => {
    try {
      await exercisesService.logExercise(exercise_id, duration_seconds);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const isDone = useCallback((exercise_id: number) => {
    return todayLogs.some((l: any) => l.exercise_id === exercise_id);
  }, [todayLogs]);

  return { exercises, todayLogs, progress, isLoading, error, refetch: fetch, completeExercise, isDone };
}
