import { api } from "@/lib/api";

export const dashboardService = {
  get: () => api.get<any>("/dashboard"),
};
