import { CountryKycAssignment, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const countryKycAssignmentApi = {
  listAll: async (): Promise<CountryKycAssignment[]> => {
    return api.get<CountryKycAssignment[]>("country_kyc_assignments");
  },

  // List country KYC assignments with pagination support
  listPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<CountryKycAssignment>>(`country_kyc_assignments/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing country KYC assignments with pagination:", error);
      throw error;
    }
  },

  // List country KYC assignments with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      return await api.post<PaginatedResponse<CountryKycAssignment>>("country_kyc_assignments/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing country KYC assignments with enhanced pagination:", error);
      throw error;
    }
  },

  // List country KYC assignments with enhanced pagination, filtering, and sorting (GET)
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
  ): Promise<PaginatedResponse<CountryKycAssignment>> => {
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

      return await api.get<PaginatedResponse<CountryKycAssignment>>(`country_kyc_assignments/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing country KYC assignments with enhanced pagination (GET):", error);
      throw error;
    }
  },

  listByCountry: async (
    countryCode: string
  ): Promise<CountryKycAssignment[]> => {
    return api.get<CountryKycAssignment[]>(
      `country_kyc_assignments/${countryCode}`
    );
  },

  assign: async (
    assignment: CountryKycAssignment
  ): Promise<CountryKycAssignment> => {
    return api.post<CountryKycAssignment>(
      "country_kyc_assignments",
      assignment
    );
  },

  delete: async (
    assignmentId: string,
    countryCode: string
  ): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(
      `country_kyc_assignments/${assignmentId}/${countryCode}`
    );
  },

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "countryCode",
    sortOrder: string = "asc"
  ): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<CountryKycAssignment>>(`country_kyc_assignments/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      return await api.get<PaginatedResponse<CountryKycAssignment>>("country_kyc_assignments/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      return await api.get<PaginatedResponse<CountryKycAssignment>>("country_kyc_assignments/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      return await api.get<PaginatedResponse<CountryKycAssignment>>("country_kyc_assignments/test-old-pagination");
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<CountryKycAssignment>> => {
    try {
      return await api.get<PaginatedResponse<CountryKycAssignment>>("country_kyc_assignments/test-post-pagination");
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
      }>("country_kyc_assignments/test-post-example");
    } catch (error: any) {
      console.error("Error fetching post example:", error);
      throw error;
    }
  },

  // Enhanced pagination debug endpoint
  listEnhancedDebug: async (requestBody: any): Promise<{
    success: boolean;
    parsed_params?: any;
    assignments_count?: number;
    total_count?: number;
    raw_body?: any;
    parse_error?: string;
    error?: string;
  }> => {
    try {
      return await api.post<{
        success: boolean;
        parsed_params?: any;
        assignments_count?: number;
        total_count?: number;
        raw_body?: any;
        parse_error?: string;
        error?: string;
      }>("country_kyc_assignments/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
      throw error;
    }
  },
};
