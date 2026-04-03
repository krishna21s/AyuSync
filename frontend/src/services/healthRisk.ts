import { api } from "@/lib/api";

export const healthRiskService = {
  getReport: () => api.get<any>("/health-risk"),
  shareWhatsApp: () => api.post<any>("/health-risk/share-whatsapp"),
};
