import { api } from "@/lib/api";

export const waterService = {
  today: () => api.get<any>("/water/today"),
  addGlass: () => api.post<any>("/water/add"),
  removeGlass: () => api.delete<any>("/water/remove"),
  updateGoal: (daily_goal: number) =>
    api.patch<any>("/water/goal", { daily_goal }),
};
