import { api } from "@/lib/api";

export const medicinesService = {
  list: () => api.get<any>("/medicines"),
  today: () => api.get<any>("/medicines/today"),
  create: (body: {
    name: string;
    dosage: string;
    scheduled_time: string;
    category: string;
    frequency: string;
  }) => api.post<any>("/medicines", body),
  update: (id: number, body: Record<string, any>) =>
    api.patch<any>(`/medicines/${id}`, body),
  remove: (id: number) => api.delete<any>(`/medicines/${id}`),
  takeDose: (medId: number, doseId: number) =>
    api.patch<any>(`/medicines/${medId}/dose/${doseId}/take`),
};
