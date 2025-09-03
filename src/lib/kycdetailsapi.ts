// src/api/kycDetailsApi.ts
import { KYCDetail } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const kycDetailsApi = {
  getAll: async (): Promise<KYCDetail[]> => {
    try {
      return await api.get<KYCDetail[]>("kyc_details");
    } catch (error: any) {
      console.error("Error fetching all KYC details:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<KYCDetail> => {
    try {
      return await api.get<KYCDetail>(`kyc_details/${id}`);
    } catch (error: any) {
      console.error(`Error fetching KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  getByLevel: async (levelId: string): Promise<KYCDetail[]> => {
    try {
      return await api.get<KYCDetail[]>(`kyc_details/level/${levelId}`);
    } catch (error: any) {
      console.error(`Error fetching KYC details for level=${levelId}:`, error);
      throw error;
    }
  },

  create: async (kycDetail: KYCDetail): Promise<KYCDetail> => {
    try {
      return await api.post<KYCDetail>("kyc_details", kycDetail);
    } catch (error: any) {
      console.error("Error creating KYC detail:", error);
      throw error;
    }
  },

  update: async (id: string, kycDetail: KYCDetail): Promise<KYCDetail> => {
    try {
      return await api.put<KYCDetail>(`kyc_details/${id}`, kycDetail);
    } catch (error: any) {
      console.error(`Error updating KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  delete: async (
    id: string,
    kycLevelId: string
  ): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(
        `kyc_details/${id}?kycLevelId=${kycLevelId}` // use snake_case to match FastAPI
      );
    } catch (error: any) {
      console.error(
        `Error deleting KYC detail with id=${id} and kycLevelId=${kycLevelId}:`,
        error
      );
      throw error;
    }
  },
};
