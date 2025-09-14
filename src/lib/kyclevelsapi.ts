import { api } from "./api";
import { KYCLevel, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";

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

  // List KYC levels with pagination support
  listPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<KYCLevel>>(`kyc_levels/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing KYC levels with pagination:", error);
      throw error;
    }
  },

  // List KYC levels with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      return await api.post<PaginatedResponse<KYCLevel>>("kyc_levels/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing KYC levels with enhanced pagination:", error);
      throw error;
    }
  },

  // List KYC levels with enhanced pagination, filtering, and sorting (GET)
  listEnhancedGet: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });

      if (search) params.append("search", search);
      if (sortField) params.append("sort_field", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);

      return await api.get<PaginatedResponse<KYCLevel>>(`kyc_levels/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing KYC levels with enhanced pagination (GET):", error);
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
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete<void>(`kyc_levels/${id}`);
    } catch (error: any) {
      console.error(`Error deleting KYC level with id=${id}:`, error);
      throw error;
    }
  },

  // Delete KYC level with cascade
  deleteWithDetails: async (id: string): Promise<{
    status: string;
    deletedCount: number;
    deletedIds: string[];
  }> => {
    try {
      return await api.delete<{
        status: string;
        deletedCount: number;
        deletedIds: string[];
      }>(`kyc_levels/${id}/cascade`);
    } catch (error: any) {
      console.error(`Error deleting KYC level with cascade for id=${id}:`, error);
      throw error;
    }
  },

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "code",
    sortOrder: string = "asc"
  ): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<KYCLevel>>(`kyc_levels/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<KYCLevel>>("kyc_levels/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<KYCLevel>>("kyc_levels/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<KYCLevel>>("kyc_levels/test-old-pagination");
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<KYCLevel>> => {
    try {
      return await api.get<PaginatedResponse<KYCLevel>>("kyc_levels/test-post-pagination");
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
      }>("kyc_levels/test-post-example");
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
      }>("kyc_levels/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
      throw error;
    }
  },
};
