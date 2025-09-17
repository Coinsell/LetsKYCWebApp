import { apiRequest } from './api';

export interface OccupationProfession {
  id?: string;
  docType: 'Occupation' | 'Profession';
  code: string;
  name: string;
  sequence: number;
  isActive: boolean;
  description?: string;
  category?: string;
  occupationCode?: string;
  occupationName?: string;
  jobTitle?: string;
  jobLevel?: string;
  requiredEducation?: string;
  salaryRange?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  catchAll?: Record<string, any>;
}

export interface OccupationWithProfessions {
  occupation: OccupationProfession;
  professions: OccupationProfession[];
  totalProfessions: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SearchParams {
  q: string;
  doc_type?: 'Occupation' | 'Profession';
  page?: number;
  page_size?: number;
}

export const occupationProfessionApi = {
  // Occupations
  async listOccupations(): Promise<OccupationProfession[]> {
    return apiRequest<OccupationProfession[]>('GET', '/occupations-professions/occupations');
  },

  async listOccupationsPaginated(page: number = 1, pageSize: number = 20, fetchAll: boolean = false): Promise<PaginationResponse<OccupationProfession>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });
    return apiRequest<PaginationResponse<OccupationProfession>>('GET', `/occupations-professions/occupations/paginated?${params}`);
  },

  async listOccupationsEnhancedGet(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<PaginationResponse<OccupationProfession>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });

    if (search) params.append("search", search);
    // Skip sort parameters for now to avoid Cosmos DB issues
    // TODO: Re-enable sorting once backend ORDER BY issues are resolved
    // if (sortField && ['name', 'code', 'category'].includes(sortField)) {
    //   params.append("sort_field", sortField);
    // }
    // if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    //   params.append("sort_order", sortOrder);
    // }

    return apiRequest<PaginationResponse<OccupationProfession>>('GET', `occupations-professions/occupations/paginated/enhanced?${params}`);
  },

  async getOccupation(code: string): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('GET', `occupations-professions/occupations/${code}`);
  },

  async createOccupation(occupation: Omit<OccupationProfession, 'id'>): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('POST', 'occupations-professions/occupations', occupation);
  },

  async updateOccupation(code: string, occupation: Partial<OccupationProfession>): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('PUT', `occupations-professions/occupations/${code}`, occupation);
  },

  async deleteOccupation(code: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `occupations-professions/occupations/${code}`);
  },

  async getOccupationWithProfessions(code: string): Promise<OccupationWithProfessions> {
    return apiRequest<OccupationWithProfessions>('GET', `occupations-professions/occupations/${code}/with-professions`);
  },

  // Professions
  async listProfessions(): Promise<OccupationProfession[]> {
    return apiRequest<OccupationProfession[]>('GET', 'occupations-professions/professions');
  },

  async listProfessionsPaginated(page: number = 1, pageSize: number = 20, fetchAll: boolean = false): Promise<PaginationResponse<OccupationProfession>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });
    return apiRequest<PaginationResponse<OccupationProfession>>('GET', `occupations-professions/professions/paginated?${params}`);
  },

  async listProfessionsEnhancedGet(
    page: number = 1,
    pageSize: number = 20,
    fetchAll: boolean = false,
    search?: string,
    sortField?: string,
    sortOrder?: string
  ): Promise<PaginationResponse<OccupationProfession>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      fetch_all: fetchAll.toString()
    });

    if (search) params.append("search", search);
    // Skip sort parameters for now to avoid Cosmos DB issues
    // TODO: Re-enable sorting once backend ORDER BY issues are resolved
    // if (sortField) params.append("sort_field", sortField);
    // if (sortOrder) params.append("sort_order", sortOrder);

    return apiRequest<PaginationResponse<OccupationProfession>>('GET', `occupations-professions/professions/paginated/enhanced?${params}`);
  },

  async getProfession(code: string): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('GET', `occupations-professions/professions/${code}`);
  },

  async createProfession(profession: Omit<OccupationProfession, 'id'>): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('POST', 'occupations-professions/professions', profession);
  },

  async updateProfession(code: string, profession: Partial<OccupationProfession>): Promise<OccupationProfession> {
    return apiRequest<OccupationProfession>('PUT', `occupations-professions/professions/${code}`, profession);
  },

  async deleteProfession(code: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('DELETE', `occupations-professions/professions/${code}`);
  },

  async getProfessionsByOccupation(occupationCode: string): Promise<OccupationProfession[]> {
    return apiRequest<OccupationProfession[]>('GET', `occupations-professions/professions/by-occupation/${occupationCode}`);
  },

  // Unified operations
  async listAll(): Promise<OccupationProfession[]> {
    return apiRequest<OccupationProfession[]>('GET', 'occupations-professions/all');
  },

  async search(params: SearchParams): Promise<OccupationProfession[]> {
    const searchParams = new URLSearchParams({
      q: params.q,
      ...(params.doc_type && { doc_type: params.doc_type }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.page_size && { page_size: params.page_size.toString() })
    });
    return apiRequest<OccupationProfession[]>('GET', `occupations-professions/search?${searchParams}`);
  },

  async searchPaginated(params: SearchParams): Promise<PaginationResponse<OccupationProfession>> {
    const searchParams = new URLSearchParams({
      q: params.q,
      ...(params.doc_type && { doc_type: params.doc_type }),
      page: (params.page || 1).toString(),
      page_size: (params.page_size || 20).toString()
    });
    return apiRequest<PaginationResponse<OccupationProfession>>('GET', `occupations-professions/search/paginated?${searchParams}`);
  },

  async getStatistics(): Promise<{
    total_occupations: number;
    total_professions: number;
    occupations_with_professions: number;
    average_professions_per_occupation: number;
    top_occupations_by_profession_count: [string, number][];
  }> {
    return apiRequest('GET', 'occupations-professions/stats');
  }
};
