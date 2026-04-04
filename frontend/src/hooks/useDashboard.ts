import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "@/services/dashboard";

export function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await dashboardService.get();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
