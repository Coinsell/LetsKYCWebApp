import { Country, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export type { Country };

export const countryApi = {
  list: async (): Promise<Country[]> => {
    return api.get<Country[]>("countries");
  },

  // List countries with pagination support
  listPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<Country>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      return await api.get<PaginatedResponse<Country>>(`countries/paginated?${params}`);
    } catch (error: any) {
      console.error("Error listing countries with pagination:", error);
      throw error;
    }
  },

  // List countries with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<Country>> => {
    try {
      return await api.post<PaginatedResponse<Country>>("countries/paginated/enhanced", paginationParams);
    } catch (error: any) {
      console.error("Error listing countries with enhanced pagination:", error);
      throw error;
    }
  },

  // List countries with enhanced pagination, filtering, and sorting (GET)
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
  ): Promise<PaginatedResponse<Country>> => {
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

      return await api.get<PaginatedResponse<Country>>(`countries/paginated/enhanced?${params}`);
    } catch (error: any) {
      console.error("Error listing countries with enhanced pagination (GET):", error);
      throw error;
    }
  },

  getById: async (id: string, code: string): Promise<Country> => {
    return api.get<Country>(`countries/${id}?code=${code}`);
  },

  getByCode: async (code: string): Promise<Country> => {
    return api.get<Country>(`countries/by-code/${code}`);
  },

  create: async (country: Country): Promise<Country> => {
    return api.post<Country>("countries", country);
  },

  updateById: async (id: string, country: Country): Promise<Country> => {
    return api.put<Country>(`countries/${id}`, country);
  },

  updateByCode: async (code: string, country: Country): Promise<Country> => {
    return api.put<Country>(`countries/by-code/${code}`, country);
  },

  deleteById: async (
    id: string,
    code: string
  ): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`countries/${id}?code=${code}`);
  },

  deleteByCode: async (code: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`countries/by-code/${code}`);
  },

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "sequence",
    sortOrder: string = "asc"
  ): Promise<PaginatedResponse<Country>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      return await api.get<PaginatedResponse<Country>>(`countries/test-enhanced-pagination?${params}`);
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<Country>> => {
    try {
      return await api.get<PaginatedResponse<Country>>("countries/test-basic-pagination");
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<Country>> => {
    try {
      return await api.get<PaginatedResponse<Country>>("countries/test-fetch-all");
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<Country>> => {
    try {
      return await api.get<PaginatedResponse<Country>>("countries/test-old-pagination");
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<Country>> => {
    try {
      return await api.get<PaginatedResponse<Country>>("countries/test-post-pagination");
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
      }>("countries/test-post-example");
    } catch (error: any) {
      console.error("Error fetching post example:", error);
      throw error;
    }
  },

  // Enhanced pagination debug endpoint
  listEnhancedDebug: async (requestBody: any): Promise<{
    success: boolean;
    parsed_params?: any;
    countries_count?: number;
    total_count?: number;
    raw_body?: any;
    parse_error?: string;
    error?: string;
  }> => {
    try {
      return await api.post<{
        success: boolean;
        parsed_params?: any;
        countries_count?: number;
        total_count?: number;
        raw_body?: any;
        parse_error?: string;
        error?: string;
      }>("countries/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
      throw error;
    }
  },
};
