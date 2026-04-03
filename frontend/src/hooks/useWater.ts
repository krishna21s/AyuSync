import { useState, useEffect, useCallback } from "react";
import { waterService } from "@/services/water";

export function useWater() {
  const [data, setData] = useState<any>({ glasses_count: 0, daily_goal: 8, remaining: 8 });
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await waterService.today();
      setData(res.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addGlass = useCallback(async () => {
    try {
      const res = await waterService.addGlass();
      setData(res.data);
    } catch { /* silent */ }
  }, []);

  const removeGlass = useCallback(async () => {
    try {
      const res = await waterService.removeGlass();
      setData(res.data);
    } catch { /* silent */ }
  }, []);

  return { data, isLoading, refetch: fetch, addGlass, removeGlass };
}
