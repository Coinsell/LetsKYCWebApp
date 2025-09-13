import { api } from "./api";
import { KYCLevel } from "@/contexts/KYCAdminContext";

export const kycLevelsApi = {
  // List all KYC levels
  list: async (): Promise<KYCLevel[]> => {
    try {
      return await api.get<KYCLevel[]>("kyc_levels");
    } catch (error: any) {
      console.error("Error fetching KYC levels:", error);
      throw error;
    }
  },

  // Get KYC level by ID
  get: async (id: string): Promise<KYCLevel> => {
    try {
      return await api.get<KYCLevel>(`kyc_levels/${id}`);
    } catch (error: any) {
      console.error(`Error fetching KYC level with id=${id}:`, error);
      throw error;
    }
  },

  // Create new KYC level
  create: async (data: Partial<KYCLevel>): Promise<KYCLevel> => {
    try {
      return await api.post<KYCLevel>("kyc_levels", data);
    } catch (error: any) {
      console.error("Error creating KYC level:", error);
      throw error;
    }
  },

  // Update KYC level by ID
  update: async (id: string, data: Partial<KYCLevel>): Promise<KYCLevel> => {
    try {
      return await api.put<KYCLevel>(`kyc_levels/${id}`, data);
    } catch (error: any) {
      console.error(`Error updating KYC level with id=${id}:`, error);
      throw error;
    }
  },

  // Delete KYC level by ID
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`kyc_levels/${id}`);
    } catch (error: any) {
      console.error(`Error deleting KYC level with id=${id}:`, error);
      throw error;
    }
  },

  // Delete KYC level with cascade (if this endpoint exists in backend)
  deleteWithDetails: async (id: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`kyc_levels/${id}/cascade`);
    } catch (error: any) {
      console.error(`Error deleting KYC level with cascade for id=${id}:`, error);
      throw error;
    }
  },
};
