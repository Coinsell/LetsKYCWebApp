// src/lib/userkycdetailsapi.ts
import { UserKYCDetail, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
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

  // Get all User KYC Details with pagination support
  getAllPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<UserKYCDetail>>(`user_kyc_details/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing user KYC details with pagination:", error);
      throw error;
    }
  },

  // List user KYC details with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      return await api.post<PaginatedResponse<UserKYCDetail>>("user_kyc_details/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing user KYC details with enhanced pagination:", error);
      throw error;
    }
  },

  // List user KYC details with enhanced pagination, filtering, and sorting (GET)
  listEnhancedGet: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string,
    filterField?: string,
    filterOperator?: string,
    filterValue?: string
  ): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });

      if (search) params.append("search", search);
      if (sortField) params.append("sort_field", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);
      if (filterField) params.append("filter_field", filterField);
      if (filterOperator) params.append("filter_operator", filterOperator);
      if (filterValue) params.append("filter_value", filterValue);

      return await api.get<PaginatedResponse<UserKYCDetail>>(`user_kyc_details/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing user KYC details with enhanced pagination (GET):", error);
      throw error;
    }
  },

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "createdAt",
    sortOrder: string = "desc"
  ): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<UserKYCDetail>>(`user_kyc_details/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCDetail>>("user_kyc_details/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<UserKYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<UserKYCDetail>>("user_kyc_details/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },
};
