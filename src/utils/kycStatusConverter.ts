// src/utils/kycStatusConverter.ts
import { KYCStatus } from '@/contexts/KYCAdminContext';

/**
 * Converts numeric KYC status values from backend to proper enum strings
 * This handles the case where backend sends integer values that need to be converted
 */
export function convertKycStatus(status: string | number): KYCStatus {
  // If it's already a string, return it as is
  if (typeof status === 'string') {
    return status as KYCStatus;
  }

  // Convert numeric values to proper enum strings
  const statusMap: Record<number, KYCStatus> = {
    0: KYCStatus.NotSubmitted,
    1: KYCStatus.InProgress,
    2: KYCStatus.Submitted,
    3: KYCStatus.UnderReview,
    4: KYCStatus.Approved,
    5: KYCStatus.Rejected,
  };

  return statusMap[status] || KYCStatus.NotSubmitted;
}

/**
 * Converts a user object's kycStatus field from numeric to string if needed
 */
export function convertUserKycStatus(user: any): any {
  if (user && typeof user.kycStatus === 'number') {
    return {
      ...user,
      kycStatus: convertKycStatus(user.kycStatus)
    };
  }
  return user;
}

/**
 * Converts an array of users' kycStatus fields from numeric to string if needed
 */
export function convertUsersKycStatus(users: any[]): any[] {
  return users.map(convertUserKycStatus);
}

// Human-readable labels for KYC status
const kycStatusLabels: Record<KYCStatus, string> = {
  [KYCStatus.NotSubmitted]: "Not Submitted",
  [KYCStatus.InProgress]: "In Progress", 
  [KYCStatus.Submitted]: "Submitted",
  [KYCStatus.UnderReview]: "Under Review",
  [KYCStatus.Approved]: "Approved",
  [KYCStatus.Rejected]: "Rejected",
};

// Original color mapping system
export const kycStatusColors: Record<KYCStatus, string> = {
  [KYCStatus.NotSubmitted]: "bg-gray-200 text-gray-700",
  [KYCStatus.InProgress]: "bg-blue-200 text-blue-700", 
  [KYCStatus.Submitted]: "bg-yellow-200 text-yellow-800",
  [KYCStatus.UnderReview]: "bg-purple-200 text-purple-700",
  [KYCStatus.Approved]: "bg-green-200 text-green-800",
  [KYCStatus.Rejected]: "bg-red-200 text-red-800",
};

/**
 * Gets the display text for a KYC status, handling both numeric and string values
 */
export function getKycStatusDisplayText(status: string | number): string {
  const convertedStatus = convertKycStatus(status);
  return kycStatusLabels[convertedStatus];
}

/**
 * Gets the CSS color classes for a KYC status
 */
export function getKycStatusColor(status: string | number): string {
  const convertedStatus = convertKycStatus(status);
  return kycStatusColors[convertedStatus];
}
