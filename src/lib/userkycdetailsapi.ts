// src/lib/userkycdetailsapi.ts
import { UserKYCDetail } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const userKycDetailsApi = {
  // Create a new User KYC Detail record
  create: async (userKycDetail: UserKYCDetail): Promise<UserKYCDetail> => {
    try {
      return await api.post<UserKYCDetail>("user_kyc_details", userKycDetail);
    } catch (error: any) {
      console.error("Error creating user KYC detail:", error);
      throw error;
    }
  },

  // Get User KYC Detail by ID
  getById: async (id: string): Promise<UserKYCDetail> => {
    try {
      return await api.get<UserKYCDetail>(`user_kyc_details/${id}`);
    } catch (error: any) {
      console.error(`Error fetching user KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  // Get all User KYC Details
  getAll: async (): Promise<UserKYCDetail[]> => {
    try {
      return await api.get<UserKYCDetail[]>("user_kyc_details");
    } catch (error: any) {
      console.error("Error fetching all user KYC details:", error);
      throw error;
    }
  },

  // Update User KYC Detail by ID
  update: async (id: string, userKycDetail: UserKYCDetail): Promise<UserKYCDetail> => {
    try {
      return await api.put<UserKYCDetail>(`user_kyc_details/${id}`, userKycDetail);
    } catch (error: any) {
      console.error(`Error updating user KYC detail with id=${id}:`, error);
      throw error;
    }
  },

  // Delete User KYC Detail by ID
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`user_kyc_details/${id}`);
    } catch (error: any) {
      console.error(`Error deleting user KYC detail with id=${id}:`, error);
      throw error;
    }
  },
};
