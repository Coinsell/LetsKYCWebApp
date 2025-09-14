// src/lib/userkyclevelsapi.ts
import { UserKYCLevel, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
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

  // Get all User KYC Levels
  getAll: async (): Promise<UserKYCLevel[]> => {
    try {
      return await api.get<UserKYCLevel[]>("user_kyc_levels");
    } catch (error: any) {
      console.error("Error fetching all user KYC levels:", error);
      throw error;
    }
  },

  // Get User KYC levels with pagination support
  getAllPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<UserKYCLevel>>(`user_kyc_levels/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing user KYC levels with pagination:", error);
      throw error;
    }
  },

  // List User KYC levels with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      return await api.post<PaginatedResponse<UserKYCLevel>>("user_kyc_levels/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing user KYC levels with enhanced pagination:", error);
      throw error;
    }
  },

  // List User KYC levels with enhanced pagination, filtering, and sorting (GET)
  listEnhancedGet: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });

      if (search) params.append("search", search);
      if (sortField) params.append("sort_field", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);

      return await api.get<PaginatedResponse<UserKYCLevel>>(`user_kyc_levels/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing user KYC levels with enhanced pagination (GET):", error);
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

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "userId",
    sortOrder: string = "asc"
  ): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<UserKYCLevel>>(`user_kyc_levels/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCLevel>>("user_kyc_levels/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCLevel>>("user_kyc_levels/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCLevel>>("user_kyc_levels/test-old-pagination");
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<UserKYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCLevel>>("user_kyc_levels/test-post-pagination");
    } catch (error: any) {
      console.error("Error testing post pagination:", error);
      throw error;
    }
  },

  testPostExample: async (): Promise<{
    message: string;
    example: any;
    curl_example: string;
  }> => {
    try {
      return await api.get<{
        message: string;
        example: any;
        curl_example: string;
      }>("user_kyc_levels/test-post-example");
    } catch (error: any) {
      console.error("Error fetching post example:", error);
      throw error;
    }
  },

  // Enhanced pagination debug endpoint
  listEnhancedDebug: async (requestBody: any): Promise<{
    success: boolean;
    parsed_params?: any;
    levels_count?: number;
    total_count?: number;
    raw_body?: any;
    parse_error?: string;
    error?: string;
  }> => {
    try {
      return await api.post<{
        success: boolean;
        parsed_params?: any;
        levels_count?: number;
        total_count?: number;
        raw_body?: any;
        parse_error?: string;
        error?: string;
      }>("user_kyc_levels/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
      throw error;
    }
  },
};
