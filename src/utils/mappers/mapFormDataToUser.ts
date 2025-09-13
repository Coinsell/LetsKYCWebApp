import { v4 as uuidv4 } from "uuid";
import { UserInfo } from "../../contexts/KYCContext";
import { KYCStatus, User as AdminUser } from "../../contexts/KYCAdminContext";
import { User as AuthUser } from "../../contexts/AuthContext";

// Utility: split full name into first and last
function splitName(fullName: string) {
  const parts = fullName.trim().split(" ");
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
}

export function mapFormDataToUser(
  formData: UserInfo,
  authUser: AuthUser
): AdminUser {
  const { firstName, lastName } = splitName(formData.fullName);

  return {
    id: uuidv4(),
    userId: authUser?.id || uuidv4(),
    docType: "User",
    firstName: firstName,
    lastName: lastName,
    login: authUser?.email || "",
    dateOfBirth: formData.dateOfBirth,
    country: formData.country || "India",
    contacts: {
      emails: [authUser?.email || ""],
      phoneNumbers: [
        {
          countryCode: "+91",
          phone: formData.mobile,
          type: "mobile",
          isPrimary: true,
        },
      ],
      addresses: [
        {
          line1: formData.addressLine1,
          line2: formData.addressLine2 || "",
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: formData.country || "India",
          type: "home",
          isPrimary: true,
        },
      ],
    },
    idProof: formData.pan,
    kycStatus: KYCStatus.NotSubmitted,
    kycJourneyStatus: 0, // NotGenerated
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
