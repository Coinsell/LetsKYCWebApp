import { User as AdminUser } from "../../contexts/KYCAdminContext";
import { convertKycStatusToNumeric } from "../kycStatusConverter";

/**
 * Converts AdminUser to API format for sending to backend
 * This ensures that kycStatus is sent as a number to the API
 */
export function mapUserToApiFormat(user: AdminUser): any {
  return {
    ...user,
    kycStatus: convertKycStatusToNumeric(user.kycStatus)
  };
}
