import { api } from "@/lib/api";

export const routineService = {
  today: () => api.get<any>("/routine/today"),
  createTask: (body: {
    name: string;
    scheduled_time: string;
    period: string;
    order?: number;
  }) => api.post<any>("/routine/tasks", body),
  updateTask: (id: number, body: Record<string, any>) =>
    api.patch<any>(`/routine/tasks/${id}`, body),
  deleteTask: (id: number) => api.delete<any>(`/routine/tasks/${id}`),
  completeTask: (id: number) =>
    api.patch<any>(`/routine/tasks/${id}/complete`),
};
