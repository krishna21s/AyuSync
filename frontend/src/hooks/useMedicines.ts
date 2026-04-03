import { useState, useEffect, useCallback } from "react";
import { medicinesService } from "@/services/medicines";

export function useMedicines() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [summary, setSummary] = useState({ taken: 0, pending: 0, missed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await medicinesService.list();
      setMedicines(res.data.medicines || []);
      setSummary(res.data.summary || { taken: 0, pending: 0, missed: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to load medicines");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const takeDose = useCallback(async (medId: number, doseId: number) => {
    try {
      await medicinesService.takeDose(medId, doseId);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const addMedicine = useCallback(async (body: any) => {
    try {
      await medicinesService.create(body);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  const deleteMedicine = useCallback(async (id: number) => {
    try {
      await medicinesService.remove(id);
      await fetch();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetch]);

  return { medicines, summary, isLoading, error, refetch: fetch, takeDose, addMedicine, deleteMedicine };
}
