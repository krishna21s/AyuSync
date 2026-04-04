import { api } from "@/lib/api";

export interface OrganImpactResult {
  targetOrgans: string[];
  riskOrgans: string[];
  recommendedSystem: "skeleton" | "vascular_system" | "visceral_system" | "nervous_system";
  confidence: "high" | "medium" | "low";
  reasoning: string;
  mechanismSummary: string;
}

export const healthRiskService = {
  getReport: () => api.get<any>("/health-risk"),
  shareWhatsApp: () => api.post<any>("/health-risk/share-whatsapp"),
  getOrganImpact: (medicine: { name: string; dosage?: string; category?: string; frequency?: string }) =>
    api.post<OrganImpactResult>("/health-risk/organ-impact", medicine),
};
