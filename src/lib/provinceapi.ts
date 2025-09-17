import { apiRequest } from './api';

export interface Province {
  id?: string;
  sequence: number;
  code: string;
  name: string;
  countryCode: string;
  countryName: string;
  subDivisionType: string;
  isRegistrationRestricted: boolean;
  catchAll?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginationParams {
  page: number;
  page_size: number;
  fetch_all: boolean;
  search?: string;
  sort_by?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

export const provinceApi = {
  // Basic CRUD operations
  async list(): Promise<Province[]> {
    return apiRequest<Province[]>('GET', '/provinces');
  },

  async getById(id: string, countryCode: string): Promise<Province> {
    return apiRequest<Province>('GET', `/provinces/${id}?country_code=${countryCode}`);
  },

  async getByCode(code: string, countryCode?: string): Promise<Province> {
    const url = countryCode ? `/provinces/by-code/${code}?country_code=${countryCode}` : `/provinces/by-code/${code}`;
    return apiRequest<Province>('GET', url);
  },

  async getByCountry(countryCode: string): Promise<Province[]> {
    return apiRequest<Province[]>('GET', `/provinces/by-country/${countryCode}`);
  },

  async create(province: Province): Promise<Province> {
    return apiRequest<Province>('POST', '/provinces', province);
  },

  async updateById(id: string, province: Province): Promise<Province> {
    return apiRequest<Province>('PUT', `/provinces/${id}`, province);
  },

  async updateByCode(code: string, provinceData: Province, countryCode?: string): Promise<Province> {
    const url = countryCode ? `/provinces/by-code/${code}?country_code=${countryCode}` : `/provinces/by-code/${code}`;
    return apiRequest<Province>('PUT', url, provinceData);
  },

  async deleteById(id: string, countryCode: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `/provinces/${id}?country_code=${countryCode}`);
  },

  async deleteByCode(code: string, countryCode?: string): Promise<{ message: string }> {
    const url = countryCode ? `/provinces/by-code/${code}?country_code=${countryCode}` : `/provinces/by-code/${code}`;
    return apiRequest<{ message: string }>('DELETE', url);
  },

  // Pagination operations
  async listPaginated(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<Province>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });
    return apiRequest<PaginatedResponse<Province>>('GET', `/provinces/paginated?${params}`);
  },

  async listEnhanced(
    paginationParams: PaginationParams
  ): Promise<PaginatedResponse<Province>> {
    return apiRequest<PaginatedResponse<Province>>('POST', '/provinces/paginated/enhanced', paginationParams);
  },

  async listEnhancedGet(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<Province>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });

    if (search) params.append('search', search);
    if (sortField) params.append('sort_field', sortField);
    if (sortOrder) params.append('sort_order', sortOrder);

    return apiRequest<PaginatedResponse<Province>>('GET', `/provinces/paginated/enhanced?${params}`);
  }
};
