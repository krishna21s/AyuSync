import { api } from "@/lib/api";

export const mealsService = {
  list: (period?: string) =>
    api.get<any>(period ? `/meals?period=${period}` : "/meals"),
  aiSuggest: () => api.get<any>("/meals/ai-suggest"),
  create: (body: Record<string, any>) => api.post<any>("/meals", body),
  logToday: () => api.get<any>("/meals/log/today"),
  logMeal: (meal_id: number, notes?: string) =>
    api.post<any>("/meals/log", { meal_id, notes }),
  removeLog: (log_id: number) => api.delete<any>(`/meals/log/${log_id}`),
};
