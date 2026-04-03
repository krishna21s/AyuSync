import { useState, useCallback } from "react";
import { healthRiskService } from "@/services/healthRisk";

export interface HealthRisk {
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  icon: string;
}

export interface FoodPrecaution {
  title: string;
  tip: string;
  avoid: boolean;
}

export interface ExercisePrecaution {
  name: string;
  duration: string;
  frequency: string;
  benefit: string;
}

export interface YogaPrecaution {
  name: string;
  duration: string;
  benefit: string;
}

export interface Precautions {
  food: FoodPrecaution[];
  exercise: ExercisePrecaution[];
  yoga: YogaPrecaution[];
}

export interface Checkup {
  test: string;
  reason: string;
  frequency: string;
  urgency: "routine" | "soon" | "urgent";
  icon: string;
}

export interface HealthRiskReport {
  generated_for: string;
  medicine_count: number;
  risks: HealthRisk[];
  precautions: Precautions;
  checkups: Checkup[];
}

export function useHealthRisk() {
  const [report, setReport] = useState<HealthRiskReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappResult, setWhatsappResult] = useState<string | null>(null);

  const generateReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setWhatsappResult(null);
      const res = await healthRiskService.getReport();
      setReport(res.data as HealthRiskReport);
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareWhatsApp = useCallback(async () => {
    try {
      setIsSending(true);
      setWhatsappResult(null);
      const res = await healthRiskService.shareWhatsApp();
      setWhatsappResult(res.data?.message || "Sent successfully!");
      // Update report data if returned
      if (res.data?.report) setReport(res.data.report as HealthRiskReport);
    } catch (err: any) {
      setWhatsappResult(err.message || "Failed to send WhatsApp message");
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    report,
    isLoading,
    isSending,
    error,
    whatsappResult,
    generateReport,
    shareWhatsApp,
  };
}
