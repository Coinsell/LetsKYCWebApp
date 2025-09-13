import { CountryKycAssignment } from "@/contexts/KYCAdminContext";
import { api } from "./api";

export const countryKycAssignmentApi = {
  listAll: async (): Promise<CountryKycAssignment[]> => {
    return api.get<CountryKycAssignment[]>("country_kyc_assignments");
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
};
