// src/lib/userapi.ts
import { User, PaginatedResponse, PaginationParams } from "@/contexts/KYCAdminContext";
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

  // List users with pagination support
  listPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<User>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        fetch_all: fetchAll.toString()
      });
      const response = await api.get<PaginatedResponse<User>>(`users/paginated?${params}`);
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error listing users with pagination:", error);
      throw error;
    }
  },

  // List users with enhanced pagination, filtering, and sorting (POST)
  listEnhanced: async (paginationParams: PaginationParams): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.post<PaginatedResponse<User>>("users/paginated/enhanced", paginationParams);
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error listing users with enhanced pagination:", error);
      throw error;
    }
  },

  // List users with enhanced pagination, filtering, and sorting (GET)
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
  ): Promise<PaginatedResponse<User>> => {
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

      const response = await api.get<PaginatedResponse<User>>(`users/paginated/enhanced?${params}`);
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error listing users with enhanced pagination (GET):", error);
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

  // Test endpoints for pagination
  testEnhancedPagination: async (
    search?: string,
    sortField: string = "createdAt",
    sortOrder: string = "desc"
  ): Promise<PaginatedResponse<User>> => {
    try {
      const params = new URLSearchParams({
        sort_field: sortField,
        sort_order: sortOrder
      });
      if (search) params.append("search", search);

      const response = await api.get<PaginatedResponse<User>>(`users/test-enhanced-pagination?${params}`);
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error testing enhanced pagination:", error);
      throw error;
    }
  },

  testBasicPagination: async (): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get<PaginatedResponse<User>>("users/test-basic-pagination");
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error testing basic pagination:", error);
      throw error;
    }
  },

  testFetchAll: async (): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get<PaginatedResponse<User>>("users/test-fetch-all");
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error testing fetch all:", error);
      throw error;
    }
  },

  testOldPagination: async (): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get<PaginatedResponse<User>>("users/test-old-pagination");
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
    } catch (error: any) {
      console.error("Error testing old pagination:", error);
      throw error;
    }
  },

  testPostPagination: async (): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get<PaginatedResponse<User>>("users/test-post-pagination");
      return {
        ...response,
        items: convertUsersKycStatus(response.items)
      };
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
      }>("users/test-post-example");
    } catch (error: any) {
      console.error("Error fetching post example:", error);
      throw error;
    }
  },

  // Enhanced pagination debug endpoint
  listEnhancedDebug: async (requestBody: any): Promise<{
    success: boolean;
    parsed_params?: any;
    users_count?: number;
    total_count?: number;
    raw_body?: any;
    parse_error?: string;
    error?: string;
  }> => {
    try {
      return await api.post<{
        success: boolean;
        parsed_params?: any;
        users_count?: number;
        total_count?: number;
        raw_body?: any;
        parse_error?: string;
        error?: string;
      }>("users/paginated/enhanced/debug", requestBody);
    } catch (error: any) {
      console.error("Error with enhanced pagination debug:", error);
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
