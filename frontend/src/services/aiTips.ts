import { api } from "@/lib/api";

export const aiTipsService = {
  get: () => api.get<any>("/ai-tips"),
};
