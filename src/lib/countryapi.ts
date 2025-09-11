import { Country } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const countryApi = {
  list: async (): Promise<Country[]> => {
    return api.get<Country[]>("/countries");
  },

  getById: async (id: string, code: string): Promise<Country> => {
    return api.get<Country>(`/countries/${id}?code=${code}`);
  },

  getByCode: async (code: string): Promise<Country> => {
    return api.get<Country>(`/countries/by-code/${code}`);
  },

  create: async (country: Country): Promise<Country> => {
    return api.post<Country>("/countries", country);
  },

  updateById: async (id: string, country: Country): Promise<Country> => {
    return api.put<Country>(`/countries/${id}`, country);
  },

  updateByCode: async (code: string, country: Country): Promise<Country> => {
    return api.put<Country>(`/countries/by-code/${code}`, country);
  },

  deleteById: async (
    id: string,
    code: string
  ): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/countries/${id}?code=${code}`);
  },

  deleteByCode: async (code: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/countries/by-code/${code}`);
  },
};
