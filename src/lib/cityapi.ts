import { apiRequest } from './api';

export interface City {
  id?: string;
  sequence: number;
  code: string;
  name: string;
  countryCode: string;
  countryName: string;
  provinceCode?: string;
  provinceName?: string;
  cityType: string;
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

export const cityApi = {
  // Basic CRUD operations
  async list(): Promise<City[]> {
    return apiRequest<City[]>('GET', '/cities');
  },

  async getById(id: string, countryCode: string): Promise<City> {
    return apiRequest<City>('GET', `/cities/${id}?country_code=${countryCode}`);
  },

  async getByCode(code: string, countryCode?: string): Promise<City> {
    const url = countryCode ? `/cities/by-code/${code}?country_code=${countryCode}` : `/cities/by-code/${code}`;
    return apiRequest<City>('GET', url);
  },

  async getByCountry(countryCode: string): Promise<City[]> {
    return apiRequest<City[]>('GET', `/cities/by-country/${countryCode}`);
  },

  async getByProvince(countryCode: string, provinceCode: string): Promise<City[]> {
    return apiRequest<City[]>('GET', `/cities/by-province/${countryCode}/${provinceCode}`);
  },

  async create(city: City): Promise<City> {
    return apiRequest<City>('POST', '/cities', city);
  },

  async updateById(id: string, city: City): Promise<City> {
    return apiRequest<City>('PUT', `/cities/${id}`, city);
  },

  async updateByCode(code: string, cityData: City, countryCode?: string): Promise<City> {
    const url = countryCode ? `/cities/by-code/${code}?country_code=${countryCode}` : `/cities/by-code/${code}`;
    return apiRequest<City>('PUT', url, cityData);
  },

  async deleteById(id: string, countryCode: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `/cities/${id}?country_code=${countryCode}`);
  },

  async deleteByCode(code: string, countryCode?: string): Promise<{ message: string }> {
    const url = countryCode ? `/cities/by-code/${code}?country_code=${countryCode}` : `/cities/by-code/${code}`;
    return apiRequest<{ message: string }>('DELETE', url);
  },

  // Pagination operations
  async listPaginated(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<City>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });
    return apiRequest<PaginatedResponse<City>>('GET', `/cities/paginated?${params}`);
  },

  async listEnhanced(
    paginationParams: PaginationParams
  ): Promise<PaginatedResponse<City>> {
    return apiRequest<PaginatedResponse<City>>('POST', '/cities/paginated/enhanced', paginationParams);
  },

  async listEnhancedGet(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<City>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });

    if (search) params.append('search', search);
    if (sortField) params.append('sort_field', sortField);
    if (sortOrder) params.append('sort_order', sortOrder);

    return apiRequest<PaginatedResponse<City>>('GET', `/cities/paginated/enhanced?${params}`);
  }
};
