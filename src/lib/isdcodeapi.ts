import { apiRequest } from './api';

export interface ISDCode {
  id?: string;
  sequence: number;
  isdCode: number;
  countryCode: string;
  countryCode2: string;
  countryName: string;
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

export const isdCodeApi = {
  // Basic CRUD operations
  async list(): Promise<ISDCode[]> {
    return apiRequest<ISDCode[]>('GET', '/isdcodes');
  },

  async getById(id: string, countryCode: string): Promise<ISDCode> {
    return apiRequest<ISDCode>('GET', `/isdcodes/${id}?country_code=${countryCode}`);
  },

  async getByCode(isdCode: number, countryCode: string): Promise<ISDCode> {
    return apiRequest<ISDCode>('GET', `/isdcodes/by-code/${isdCode}?country_code=${countryCode}`);
  },

  async getByISD(isdCode: number): Promise<ISDCode> {
    return apiRequest<ISDCode>('GET', `/isdcodes/by-isd/${isdCode}`);
  },

  async getByCountry(countryCode: string): Promise<ISDCode[]> {
    return apiRequest<ISDCode[]>('GET', `/isdcodes/by-country/${countryCode}`);
  },

  async create(isdCode: ISDCode): Promise<ISDCode> {
    return apiRequest<ISDCode>('POST', '/isdcodes', isdCode);
  },

  async updateById(id: string, isdCode: ISDCode, countryCode?: string): Promise<ISDCode> {
    const url = countryCode ? `/isdcodes/${id}?country_code=${countryCode}` : `/isdcodes/${id}`;
    return apiRequest<ISDCode>('PUT', url, isdCode);
  },

  async updateByCode(isdCode: number, countryCode: string, isdCodeData: ISDCode): Promise<ISDCode> {
    return apiRequest<ISDCode>('PUT', `/isdcodes/by-code/${isdCode}?country_code=${countryCode}`, isdCodeData);
  },

  async deleteById(id: string, countryCode: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `/isdcodes/${id}?country_code=${countryCode}`);
  },

  async deleteByCode(isdCode: number, countryCode: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `/isdcodes/by-code/${isdCode}?country_code=${countryCode}`);
  },

  // Pagination operations
  async listPaginated(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false
  ): Promise<PaginatedResponse<ISDCode>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });
    return apiRequest<PaginatedResponse<ISDCode>>('GET', `/isdcodes/paginated?${params}`);
  },

  async listEnhanced(
    paginationParams: PaginationParams
  ): Promise<PaginatedResponse<ISDCode>> {
    return apiRequest<PaginatedResponse<ISDCode>>('POST', '/isdcodes/paginated/enhanced', paginationParams);
  },

  async listEnhancedGet(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedResponse<ISDCode>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });

    if (search) params.append('search', search);
    if (sortField) params.append('sort_field', sortField);
    if (sortOrder) params.append('sort_order', sortOrder);

    return apiRequest<PaginatedResponse<ISDCode>>('GET', `/isdcodes/paginated/enhanced?${params}`);
  }
};
