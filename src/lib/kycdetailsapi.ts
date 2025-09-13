// src/lib/kycdetailsapi.ts
import { KYCDetail } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const kycDetailsApi = {
  // Get all KYC details
  getAll: async (): Promise<KYCDetail[]> => {
    try {
      return await api.get<KYCDetail[]>("kyc_details");
    } catch (error: any) {
      console.error("Error fetching all KYC details:", error);
      throw error;
    }
  },

  // Get KYC detail by ID
  getById: async (id: string): Promise<KYCDetail> => {
    try {
      return await api.get<KYCDetail>(`kyc_details/${id}`);
    } catch (error: any) {
      console.error(`Error fetching KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  // Get KYC details by level ID
  getByLevel: async (kycLevelId: string): Promise<KYCDetail[]> => {
    try {
      return await api.get<KYCDetail[]>(`kyc_details/level/${kycLevelId}`);
    } catch (error: any) {
      console.error(`Error fetching KYC details for level ${kycLevelId}:`, error);
      throw error;
    }
  },


  // Create new KYC detail
  create: async (kycDetail: KYCDetail): Promise<KYCDetail> => {
    try {
      return await api.post<KYCDetail>("kyc_details", kycDetail);
    } catch (error: any) {
      console.error("Error creating KYC detail:", error);
      throw error;
    }
  },

  // Update KYC detail by ID
  update: async (id: string, kycDetail: KYCDetail): Promise<KYCDetail> => {
    try {
      return await api.put<KYCDetail>(`kyc_details/${id}`, kycDetail);
    } catch (error: any) {
      console.error(`Error updating KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  // Delete KYC detail by ID
  delete: async (id: string, kycLevelId: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`kyc_details/${id}?kycLevelId=${kycLevelId}`);
    } catch (error: any) {
      console.error(`Error deleting KYC detail with id=${id}:`, error);
      throw error;
    }
  },
};
