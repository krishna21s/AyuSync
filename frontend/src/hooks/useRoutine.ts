import { useState, useEffect, useCallback } from "react";
import { routineService } from "@/services/routine";

export function useRoutine() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await routineService.today();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load routine");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleTask = useCallback(async (id: number) => {
    try {
      await routineService.completeTask(id);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const addTask = useCallback(async (body: any) => {
    try {
      await routineService.createTask(body);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      await routineService.deleteTask(id);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch, toggleTask, addTask, deleteTask };
}
