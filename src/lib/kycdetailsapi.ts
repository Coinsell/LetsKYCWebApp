// src/lib/kycdetailsapi.ts
import { KYCDetail, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
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

  // Get KYC details with pagination support
  getAllPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<KYCDetail>>(`kyc_details/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing KYC details with pagination:", error);
      throw error;
    }
  },

  // List KYC details with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      return await api.post<PaginatedResponse<KYCDetail>>("kyc_details/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing KYC details with enhanced pagination:", error);
      throw error;
    }
  },

  // List KYC details with enhanced pagination, filtering, and sorting (GET)
  listEnhancedGet: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });

      if (search) params.append("search", search);
      if (sortField) params.append("sort_field", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);

      return await api.get<PaginatedResponse<KYCDetail>>(`kyc_details/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing KYC details with enhanced pagination (GET):", error);
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

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "name",
    sortOrder: string = "asc"
  ): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<KYCDetail>>(`kyc_details/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<KYCDetail>>("kyc_details/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<KYCDetail>>("kyc_details/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<KYCDetail>>("kyc_details/test-old-pagination");
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<KYCDetail>> => {
    try {
      return await api.get<PaginatedResponse<KYCDetail>>("kyc_details/test-post-pagination");
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
      }>("kyc_details/test-post-example");
    } catch (error: any) {
      console.error("Error fetching post example:", error);
      throw error;
    }
  },

  // Enhanced pagination debug endpoint
  listEnhancedDebug: async (requestBody: any): Promise<{
    success: boolean;
    parsed_params?: any;
    details_count?: number;
    total_count?: number;
    raw_body?: any;
    parse_error?: string;
    error?: string;
  }> => {
    try {
      return await api.post<{
        success: boolean;
        parsed_params?: any;
        details_count?: number;
        total_count?: number;
        raw_body?: any;
        parse_error?: string;
        error?: string;
      }>("kyc_details/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
      throw error;
    }
  },
};
