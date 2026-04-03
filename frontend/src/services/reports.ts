import { api } from "@/lib/api";

export const reportsService = {
  summary: () => api.get<any>("/reports/summary"),
  weeklyAdherence: () => api.get<any>("/reports/weekly-adherence"),
  waterTrend: () => api.get<any>("/reports/water-trend"),
  medicineCategories: () => api.get<any>("/reports/medicine-categories"),
  monthlySummary: () => api.get<any>("/reports/monthly-summary"),
};
