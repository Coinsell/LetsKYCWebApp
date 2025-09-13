// src/lib/userkyclevelsapi.ts
import { UserKYCLevel } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const userKycLevelsApi = {
  // Create/assign a new User KYC Level
  create: async (userKycLevel: UserKYCLevel): Promise<UserKYCLevel> => {
    try {
      return await api.post<UserKYCLevel>("user_kyc_levels", userKycLevel);
    } catch (error: any) {
      console.error("Error creating user KYC level:", error);
      throw error;
    }
  },

  // Get User KYC Level by ID and user ID
  getById: async (id: string, userId: string): Promise<UserKYCLevel> => {
    try {
      return await api.get<UserKYCLevel>(`user_kyc_levels/${id}?user_id=${userId}`);
    } catch (error: any) {
      console.error(`Error fetching user KYC level with id=${id} and userId=${userId}:`, error);
      throw error;
    }
  },

  // List all User KYC Levels for a specific user
  listByUserId: async (userId: string): Promise<UserKYCLevel[]> => {
    try {
      return await api.get<UserKYCLevel[]>(`user_kyc_levels/user/${userId}`);
    } catch (error: any) {
      console.error(`Error fetching user KYC levels for userId=${userId}:`, error);
      throw error;
    }
  },

  // Update User KYC Level by ID
  update: async (id: string, userKycLevel: UserKYCLevel): Promise<UserKYCLevel> => {
    try {
      return await api.put<UserKYCLevel>(`user_kyc_levels/${id}`, userKycLevel);
    } catch (error: any) {
      console.error(`Error updating user KYC level with id=${id}:`, error);
      throw error;
    }
  },

  // Delete User KYC Level by ID and user ID
  delete: async (id: string, userId: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`user_kyc_levels/${id}?user_id=${userId}`);
    } catch (error: any) {
      console.error(`Error deleting user KYC level with id=${id} and userId=${userId}:`, error);
      throw error;
    }
  },
};
