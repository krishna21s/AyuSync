import { api } from "@/lib/api";

export const exercisesService = {
  list: (category?: string) =>
    api.get<any>(
      category && category !== "all"
        ? `/exercises?category=${category}`
        : "/exercises"
    ),
  create: (body: Record<string, any>) => api.post<any>("/exercises", body),
  logToday: () => api.get<any>("/exercises/log/today"),
  logExercise: (exercise_id: number, duration_seconds?: number) =>
    api.post<any>("/exercises/log", { exercise_id, duration_seconds }),
  removeLog: (log_id: number) =>
    api.delete<any>(`/exercises/log/${log_id}`),
  progress: () => api.get<any>("/exercises/progress"),
};
