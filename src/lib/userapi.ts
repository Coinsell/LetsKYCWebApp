// src/lib/userapi.ts
import { User } from "@/contexts/KYCAdminContext";
import { api } from "./api";
import { convertUsersKycStatus, convertUserKycStatus } from "@/utils/kycStatusConverter";

export const userApi = {
  // Create a new user
  create: async (user: User): Promise<User> => {
    try {
      return await api.post<User>("users", user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // List users with optional limit
  list: async (limit?: number): Promise<User[]> => {
    try {
      const params = limit ? `?limit=${limit}` : "";
      const users = await api.get<User[]>(`users${params}`);
      return convertUsersKycStatus(users);
    } catch (error: any) {
      console.error("Error listing users:", error);
      throw error;
    }
  },

  // Get user by login (email)
  getByLogin: async (login: string): Promise<User> => {
    try {
      const user = await api.get<User>(`users/by-login/${login}`);
      return convertUserKycStatus(user);
    } catch (error: any) {
      console.error(`Error fetching user by login=${login}:`, error);
      throw error;
    }
  },

  // List users with incomplete KYC journey
  listIncompleteJourney: async (batchSize: number = 100): Promise<User[]> => {
    try {
      const users = await api.get<User[]>(`users/incomplete-journey/?batch_size=${batchSize}`);
      return convertUsersKycStatus(users);
    } catch (error: any) {
      console.error("Error fetching users with incomplete journey:", error);
      throw error;
    }
  },

  // Get user by ID
  get: async (userId: string): Promise<User> => {
    try {
      const user = await api.get<User>(`users/${userId}`);
      return convertUserKycStatus(user);
    } catch (error: any) {
      console.error(`Error fetching user with id=${userId}:`, error);
      throw error;
    }
  },

  // Update user by ID
  update: async (userId: string, user: User): Promise<User> => {
    try {
      return await api.put<User>(`users/${userId}`, user);
    } catch (error: any) {
      console.error(`Error updating user with id=${userId}:`, error);
      throw error;
    }
  },

  // Delete user by ID
  delete: async (userId: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`users/${userId}`);
    } catch (error: any) {
      console.error(`Error deleting user with id=${userId}:`, error);
      throw error;
    }
  },

  // Debug endpoints
  debugAllDocuments: async (): Promise<{ total_documents: number; documents: any[] }> => {
    try {
      return await api.get<{ total_documents: number; documents: any[] }>("users/debug/all-documents");
    } catch (error: any) {
      console.error("Error fetching debug all documents:", error);
      throw error;
    }
  },

  debugTestDocTypeFields: async (): Promise<{ field_test_results: any }> => {
    try {
      return await api.get<{ field_test_results: any }>("users/debug/test-doc-type-fields");
    } catch (error: any) {
      console.error("Error fetching debug test doc type fields:", error);
      throw error;
    }
  },

  debugTestQueryFormats: async (): Promise<{ query_test_results: any }> => {
    try {
      return await api.get<{ query_test_results: any }>("users/debug/test-query-formats");
    } catch (error: any) {
      console.error("Error fetching debug test query formats:", error);
      throw error;
    }
  },
};
