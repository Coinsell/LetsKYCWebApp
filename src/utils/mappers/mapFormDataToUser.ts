import { v4 as uuidv4 } from "uuid";
import { UserInfo } from "../../contexts/KYCContext";
import { KYCStatus, User } from "../../contexts/KYCAdminContext";
import { AuthUser } from "../../contexts/AuthContext";

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
): User {
  const { firstName, lastName } = splitName(formData.fullName);

  return {
    id: uuidv4(),
    userId: authUser?.id || uuidv4(),
    first_name: firstName,
    last_name: lastName,
    login: authUser?.email || "",
    date_of_birth: formData.dateOfBirth, // already yyyy-mm-dd
    country: formData.country || "India",
    contacts: {
      emails: [authUser?.email || ""],
      phone_numbers: [
        {
          country_code: "+91",
          phone_number: formData.mobile,
          type: "mobile",
          is_primary: true,
        },
      ],
      addresses: [
        {
          line1: formData.addressLine1,
          line2: formData.addressLine2 || "",
          city: formData.city,
          state: formData.state,
          postal_code: formData.pincode,
          country: formData.country || "India",
          type: "home",
          is_primary: true,
        },
      ],
    },
    id_proof: formData.pan, // until UserKYCDetail attachments are implemented
    kyc_status: KYCStatus.NotSubmitted,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
