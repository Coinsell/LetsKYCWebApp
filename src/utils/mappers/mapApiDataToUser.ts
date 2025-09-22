import { User as AdminUser } from "../../contexts/KYCAdminContext";
import { convertKycStatus } from "../kycStatusConverter";

/**
 * Converts API data to AdminUser format for frontend use
 * This ensures that numeric kycStatus from API is converted back to enum
 */
export function mapApiDataToUser(apiUser: any): AdminUser {
  return {
    ...apiUser,
    kycStatus: convertKycStatus(apiUser.kycStatus)
  };
}
