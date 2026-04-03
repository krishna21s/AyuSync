import { api } from "@/lib/api";

export const prescriptionService = {
  /**
   * Upload a prescription image and get real AI-extracted medicines back.
   * Returns { medicines: [...], count: N }
   */
  scan: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Use raw fetch so we can send FormData (api.post assumes JSON)
    const token = localStorage.getItem("healthai_token");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/prescription/scan`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Scan failed" }));
      throw new Error(err.detail || "Prescription scan failed");
    }

    return response.json() as Promise<{ data: { medicines: any[]; count: number } }>;
  },
};
