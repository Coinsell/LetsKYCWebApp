import { api } from "./api";
import { KYCLevel } from "@/contexts/KYCAdminContext";

export const kycLevelsApi = {
  list: () => api.get<KYCLevel[]>("kyc_levels"),
  get: (id: string) => api.get<KYCLevel>(`kyc_levels/${id}`),
  create: (data: Partial<KYCLevel>) => api.post<KYCLevel>("kyc_levels", data),
  update: (id: string, data: Partial<KYCLevel>) =>
    api.put<KYCLevel>(`kyc_levels/${id}`, data),
  delete: (id: string) => api.delete<void>(`kyc_levels/${id}`),
};
