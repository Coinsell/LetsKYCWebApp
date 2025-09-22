import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useKYC, UserInfo } from "../../contexts/KYCContext";

import { useAuth } from "@/contexts/AuthContext";
import { mapFormDataToUser } from "@/utils/mappers/mapFormDataToUser";
import { mapUserToApiFormat } from "@/utils/mappers/mapUserToApiFormat";
import { mapApiDataToUser } from "@/utils/mappers/mapApiDataToUser";
import { User } from "@/contexts/KYCAdminContext";
import { userApi } from "@/lib/userapi";

interface UserInfoStepProps {
  onNext: () => void;
  buttonText?: string;
  forceReload?: boolean; // Add this to force data reload
}

export function UserInfoStep({ onNext, buttonText = "Continue", forceReload = false }: UserInfoStepProps) {
  const { dispatch } = useKYC();
  const { user: authUser } = useAuth();

  // Extract user ID from URL for journey-based flows
  const getUserIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/');
    const journeyIndex = pathParts.findIndex(part => part === 'journey');
    
    console.log("🔍 URL Debug Info:");
    console.log("  - Full URL:", window.location.href);
    console.log("  - Pathname:", window.location.pathname);
    console.log("  - Search params:", window.location.search);
    console.log("  - Path parts:", pathParts);
    console.log("  - Journey index:", journeyIndex);
    
    if (journeyIndex !== -1 && pathParts[journeyIndex + 1]) {
      const userId = pathParts[journeyIndex + 1];
      console.log("🔍 Extracted user ID from URL:", userId);
      return userId;
    }
    
    console.log("❌ Could not extract user ID from URL");
    return null;
  };

  // Get user ID from URL first (KYC journey doesn't need authentication)
  const getUserId = () => {
    const urlUserId = getUserIdFromUrl();
    const authUserId = authUser?.id;
    
    console.log("🔍 URL user ID (primary):", urlUserId);
    console.log("🔍 Auth user ID (fallback):", authUserId);
    console.log("🔍 Auth user object:", authUser);
    
    // For KYC journey, URL user ID is primary, auth is only fallback
    const finalUserId = urlUserId || authUserId;
    
    console.log("🔍 Final user ID:", finalUserId);
    console.log("🔍 Final user ID type:", typeof finalUserId);
    
    return finalUserId;
  };
  const [formData, setFormData] = useState<UserInfo>({
    fullName: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    pan: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load existing user data when component mounts or when auth user changes
  useEffect(() => {
    console.log("🔄 UserInfoStep useEffect triggered - Component mounted/remounted");
    const userId = getUserId();
    console.log("🔍 Resolved user ID:", userId);
    console.log("🔍 Auth user ID:", authUser?.id);
    console.log("🔍 Auth user email:", authUser?.email);
    console.log("🔍 Current form data:", formData);
    console.log("🔍 Force reload:", forceReload);
    console.log("🔍 Is initial loading:", isInitialLoading);
    
    const loadUserData = async () => {
      if (!userId) {
        console.log("❌ No user ID available (neither auth nor URL), skipping data load");
        setIsInitialLoading(false);
        return;
      }

      try {
        console.log("🔄 Loading existing user data for ID:", userId);
        console.log("🔍 Auth user object:", authUser);
        const apiUser = await userApi.get(userId);
        console.log("✅ Loaded user data from API:", apiUser);
        
        // Convert API data to frontend format
        const existingUser = mapApiDataToUser(apiUser);
        console.log("✅ Converted user data for frontend:", existingUser);

        if (existingUser) {
          // Map the existing user data to form data
          const rawDateOfBirth = existingUser.dateOfBirth;
          const formattedDateOfBirth = rawDateOfBirth ? new Date(rawDateOfBirth).toISOString().split('T')[0] : '';
          
          console.log("📅 Raw date of birth from DB:", rawDateOfBirth);
          console.log("📅 Formatted date of birth for form:", formattedDateOfBirth);
          
          const mappedFormData: UserInfo = {
            fullName: `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
            dateOfBirth: formattedDateOfBirth,
            addressLine1: existingUser.contacts?.addresses?.[0]?.line1 || '',
            addressLine2: existingUser.contacts?.addresses?.[0]?.line2 || '',
            city: existingUser.contacts?.addresses?.[0]?.city || '',
            state: existingUser.contacts?.addresses?.[0]?.state || '',
            pincode: existingUser.contacts?.addresses?.[0]?.postalCode || '',
            country: existingUser.contacts?.addresses?.[0]?.country === 'IN' ? 'India' : (existingUser.contacts?.addresses?.[0]?.country || 'India'),
            pan: existingUser.idProof || '',
            mobile: existingUser.contacts?.phoneNumbers?.[0]?.phone || '',
          };
          
          console.log("📝 Mapped form data from existing user:", mappedFormData);
          console.log("🔍 Address data:", {
            addressLine1: mappedFormData.addressLine1,
            addressLine2: mappedFormData.addressLine2,
            city: mappedFormData.city,
            state: mappedFormData.state,
            pincode: mappedFormData.pincode
          });
          console.log("🔍 Phone data:", mappedFormData.mobile);
          console.log("🔍 PAN data:", mappedFormData.pan);
          setFormData(mappedFormData);
          console.log("✅ Form data set successfully");
        } else {
          console.log("ℹ️ No existing user data found, using empty form");
        }
      } catch (error: any) {
        console.error("❌ Error loading user data:", error);
        if (error.message.includes('404') || error.message.includes('not found')) {
          console.log("ℹ️ User doesn't exist yet, using empty form");
          // Don't show error message for 404, just use empty form
        } else {
          setSubmitMessage({ 
            type: 'error', 
            text: `Failed to load existing data: ${error.message}` 
          });
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserData();
  }, [authUser?.id, authUser?.email, forceReload]); // Also depend on email and forceReload

  // Debug form data changes
  useEffect(() => {
    console.log("📝 Form data changed:", formData);
  }, [formData]);

  // Check if we need to reload data when component becomes visible
  useEffect(() => {
    console.log("🔍 UserInfoStep component rendered");
    const userId = getUserId();
    console.log("🔍 Current form data state:", formData);
    console.log("🔍 Is initial loading:", isInitialLoading);
    console.log("🔍 Resolved user ID:", userId);
    
    // Always try to load data if we have a user ID and form is empty
    if (userId && (!formData.fullName || formData.fullName.trim() === '')) {
      console.log("🔄 Form appears empty or incomplete, triggering data reload...");
      console.log("🔄 Current form data:", formData);
      
      const loadUserData = async () => {
        try {
          console.log("🔄 Fetching user data from API for userId:", userId);
          console.log("🔄 Current URL:", window.location.href);
          console.log("🔄 Pathname:", window.location.pathname);
          console.log("🔄 Search params:", window.location.search);
          
          const apiUser = await userApi.get(userId);
          console.log("🔄 Raw user data from API:", apiUser);
          
          // Convert API data to frontend format
          const existingUser = mapApiDataToUser(apiUser);
          console.log("✅ Converted user data for frontend:", existingUser);
          
          if (existingUser) {
            const rawDateOfBirth = existingUser.dateOfBirth;
            const formattedDateOfBirth = rawDateOfBirth ? new Date(rawDateOfBirth).toISOString().split('T')[0] : '';
            
            console.log("📅 Reload - Raw date of birth from DB:", rawDateOfBirth);
            console.log("📅 Reload - Formatted date of birth for form:", formattedDateOfBirth);
            
            const mappedFormData: UserInfo = {
              fullName: `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
              dateOfBirth: formattedDateOfBirth,
              addressLine1: existingUser.contacts?.addresses?.[0]?.line1 || '',
              addressLine2: existingUser.contacts?.addresses?.[0]?.line2 || '',
              city: existingUser.contacts?.addresses?.[0]?.city || '',
              state: existingUser.contacts?.addresses?.[0]?.state || '',
              pincode: existingUser.contacts?.addresses?.[0]?.postalCode || '',
              country: existingUser.contacts?.addresses?.[0]?.country === 'IN' ? 'India' : (existingUser.contacts?.addresses?.[0]?.country || 'India'),
              pan: existingUser.idProof || '',
              mobile: existingUser.contacts?.phoneNumbers?.[0]?.phone || '',
            };
            console.log("🔄 Mapped form data:", mappedFormData);
            console.log("🔄 Setting form data...");
            setFormData(mappedFormData);
            console.log("✅ Form data set successfully");
          } else {
            console.log("❌ No user data found in API response");
          }
        } catch (error: any) {
          console.error("❌ Error reloading data:", error);
          if (error.message?.includes('404') || error.message?.includes('not found')) {
            console.log("⚠️ User not found in database, this might be a new user");
            // Don't show error for new users, just log it
          } else {
            console.error("❌ Unexpected error loading user data:", error);
          }
        }
      };
      
      loadUserData();
    } else if (!authUser?.id) {
      console.log("❌ No auth user ID available for data loading");
    } else {
      console.log("ℹ️ Form already has data, skipping reload");
    }
  });

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
    
    return actualAge >= 18;
  };

  const validateForm = () => {
    console.log("🔍 Starting form validation...");
    console.log("📝 Current form data:", formData);
    
    const newErrors: Partial<UserInfo> = {};

    if (!formData.fullName.trim()) {
      console.log("❌ Full name is missing");
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.dateOfBirth) {
      console.log("❌ Date of birth is missing");
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!validateAge(formData.dateOfBirth)) {
      console.log("❌ Age validation failed");
      newErrors.dateOfBirth = "You must be at least 18 years old for KYC";
    }
    
    if (!formData.addressLine1.trim()) {
      console.log("❌ Address line 1 is missing");
      newErrors.addressLine1 = "Address line 1 is required";
    }
    
    if (!formData.city.trim()) {
      console.log("❌ City is missing");
      newErrors.city = "City is required";
    }
    
    if (!formData.state.trim()) {
      console.log("❌ State is missing");
      newErrors.state = "State is required";
    }
    
    if (!formData.pincode.trim()) {
      console.log("❌ Pincode is missing");
      newErrors.pincode = "Pincode is required";
    }
    
    if (!formData.pan.trim()) {
      console.log("❌ PAN is missing");
      newErrors.pan = "PAN is required";
    } else if (!validatePAN(formData.pan)) {
      console.log("❌ PAN format is invalid");
      newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    
    if (!formData.mobile.trim()) {
      console.log("❌ Mobile number is missing");
      newErrors.mobile = "Mobile number is required";
    } else if (!validateMobile(formData.mobile)) {
      console.log("❌ Mobile number format is invalid");
      newErrors.mobile = "Invalid mobile number";
    }

    console.log("🔍 Validation errors found:", newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("✅ Form validation result:", isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 Form submit button clicked!");
    console.log("🔍 Event object:", e);
    e.preventDefault();
    console.log("✅ Form preventDefault called");

    console.log("🔍 Validating form...");
    console.log("🔍 Current form data before validation:", formData);
    const isValid = validateForm();
    console.log("📋 Form validation result:", isValid);
    
    if (!isValid) {
      console.log("❌ Form validation failed, stopping submission");
      console.log("❌ Current errors:", errors);
      return;
    }
    
    console.log("✅ Form validation passed, proceeding with submission");
    console.log("🔍 Final form data to submit:", formData);

    setIsLoading(true);
    setSubmitMessage(null);
    
    console.log("Starting form submission...");
    console.log("Form Data:", formData);
    console.log("Auth User:", authUser);

    try {
      const userId = getUserId();
      console.log("🔍 Using user ID for update:", userId);
      
      const mappedUser = mapFormDataToUser(formData, authUser);
      console.log("Mapped User:", mappedUser);
      
      // Use the resolved user ID instead of generating a new one
      const userToUpdate = {
        ...mappedUser,
        id: userId || mappedUser.id,
        userId: userId || mappedUser.userId
      };

      console.log("🔍 Resolved User ID:", userId);
      console.log("🔍 Mapped User ID:", mappedUser.id);
      console.log("🔍 Final User ID to use:", userToUpdate.id);

      console.log("📝 User to Update:", userToUpdate);
      console.log("📋 Contacts object:", userToUpdate.contacts);
      console.log("📋 Addresses array:", userToUpdate.contacts.addresses);
      console.log("📋 Phone numbers array:", userToUpdate.contacts.phoneNumbers);
      console.log("📋 PAN (idProof):", userToUpdate.idProof);
      console.log("🚀 Making API call to update user...");
      console.log("🔗 API endpoint will be: PUT /users/" + userToUpdate.id);

      let result;
      try {
        // First, get the existing user data to merge properly
        console.log("🔄 Getting existing user data for merging...");
        const existingUser = await userApi.get(userToUpdate.id);
        console.log("📋 Existing user data:", existingUser);
        
        // Merge the existing data with new data
        const mergedUser = {
          ...existingUser,
          ...userToUpdate,
          contacts: {
            ...existingUser.contacts,
            ...userToUpdate.contacts,
            // Ensure we have the latest data
            emails: userToUpdate.contacts.emails,
            phoneNumbers: userToUpdate.contacts.phoneNumbers,
            addresses: userToUpdate.contacts.addresses,
          },
          // Update the timestamp
          updatedAt: new Date().toISOString(),
        };
        
        console.log("🔀 Merged user data:", mergedUser);
        console.log("🔀 Merged contacts:", mergedUser.contacts);
        
        // Convert to API format before sending
        const apiUser = mapUserToApiFormat(mergedUser);
        console.log("🔀 API format user data:", apiUser);
        
        // Try to update with merged data
        result = await userApi.update(userToUpdate.id, apiUser);
        console.log("✅ User updated successfully:", result);
      } catch (updateError: any) {
        console.log("⚠️ Update failed, trying to create user:", updateError.message);
        if (updateError.message.includes('404') || updateError.message.includes('not found')) {
          // User doesn't exist, create them
          console.log("🆕 Creating new user...");
          const apiUser = mapUserToApiFormat(userToUpdate);
          result = await userApi.create(apiUser);
          console.log("✅ User created successfully:", result);
        } else {
          // Re-throw other errors
          throw updateError;
        }
      }

      console.log("✅ Final API Response:", result);
      console.log("📊 Response type:", typeof result);
      console.log("📋 Response keys:", result ? Object.keys(result) : 'null/undefined');
      console.log("📋 Response contacts:", result?.contacts);
      console.log("📋 Response addresses:", result?.contacts?.addresses);
      console.log("📋 Response phoneNumbers:", result?.contacts?.phoneNumbers);
      console.log("📋 Response idProof:", result?.idProof);

      if (result) {
        // Update KYC context (your form flow)
        dispatch({ type: "SET_USER_INFO", payload: formData });

        // Update KYCAdmin context (admin state)
        //adminDispatch({ type: "ADD_USER", payload: result });

        setSubmitMessage({ type: 'success', text: 'User information saved successfully!' });
        console.log("✅ Form submitted successfully, calling onNext...");
        console.log("✅ Data that should be saved:", {
          addresses: result.contacts?.addresses,
          phoneNumbers: result.contacts?.phoneNumbers,
          idProof: result.idProof
        });
        
        // Small delay to show success message before proceeding
        setTimeout(() => {
        onNext();
        }, 1000);
      } else {
        console.log("❌ No result returned from API");
        setSubmitMessage({ type: 'error', text: 'No response received from server' });
      }
    } catch (err) {
      console.error("API error:", err);
      setSubmitMessage({ 
        type: 'error', 
        text: `Failed to save user information: ${err instanceof Error ? err.message : 'Unknown error'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear any existing submit messages when user starts typing
    if (submitMessage) {
      setSubmitMessage(null);
    }
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    console.log("🔍 Checking form validity...");
    console.log("🔍 Form data:", formData);
    
    const checks = {
      fullName: formData.fullName.trim(),
      dateOfBirth: formData.dateOfBirth,
      ageValid: formData.dateOfBirth ? validateAge(formData.dateOfBirth) : false,
      addressLine1: formData.addressLine1.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      pan: formData.pan.trim(),
      panValid: formData.pan.trim() ? validatePAN(formData.pan) : false,
      mobile: formData.mobile.trim(),
      mobileValid: formData.mobile.trim() ? validateMobile(formData.mobile) : false,
    };
    
    console.log("🔍 Validation checks:", checks);
    
    const isValid = checks.fullName && 
                   checks.dateOfBirth && 
                   checks.ageValid &&
                   checks.addressLine1 && 
                   checks.city && 
                   checks.state && 
                   checks.pincode && 
                   checks.pan && 
                   checks.panValid &&
                   checks.mobile && 
                   checks.mobileValid;
    
    console.log("🔍 Form is valid:", isValid);
    return isValid;
  };

  return (
    <Card className="relative">
      {/* Loading overlay for initial data load */}
      {isInitialLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" fullscreen={false} />
            <p className="mt-2 text-sm text-gray-600">Loading your information...</p>
          </div>
        </div>
      )}

      {/* Loading overlay for form submission */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" fullscreen={false} />
            <p className="mt-2 text-sm text-gray-600">Saving your information...</p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Please provide your details as they appear on your PAN card
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name (as per PAN) *
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date of Birth *
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Address Line 1 *
            </label>
            <Input
              value={formData.addressLine1}
              onChange={(e) =>
                handleInputChange("addressLine1", e.target.value)
              }
              placeholder="House/Flat number, Street name"
              className={errors.addressLine1 ? "border-red-500" : ""}
            />
            {errors.addressLine1 && (
              <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Address Line 2
            </label>
            <Input
              value={formData.addressLine2}
              onChange={(e) =>
                handleInputChange("addressLine2", e.target.value)
              }
              placeholder="Area, Landmark (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                City *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                State *
              </label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pincode *
              </label>
              <Input
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="Pincode"
                className={errors.pincode ? "border-red-500" : ""}
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                PAN Number *
              </label>
              <Input
                value={formData.pan}
                onChange={(e) =>
                  handleInputChange("pan", e.target.value.toUpperCase())
                }
                placeholder="ABCDE1234F"
                maxLength={10}
                className={errors.pan ? "border-red-500" : ""}
              />
              {errors.pan && (
                <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Format: 5 letters + 4 digits + 1 letter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Mobile Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-400 bg-neutral-200 text-neutral-700 text-sm">
                  +91
                </span>
                <Input
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`rounded-l-none ${
                    errors.mobile ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>

          {/* Success/Error Message */}
          {submitMessage && (
            <div className={`p-4 rounded-md ${
              submitMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {submitMessage.text}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isLoading || isInitialLoading || !isFormValid()}
              className="min-w-[120px]"
              onClick={(e) => {
                console.log("🔘 Button clicked!");
                console.log("🔘 Button click event:", e);
                console.log("🔘 Button disabled state:", isLoading || isInitialLoading || !isFormValid());
                console.log("🔘 Form valid:", isFormValid());
                console.log("🔘 Is loading:", isLoading);
                console.log("🔘 Is initial loading:", isInitialLoading);
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" fullscreen={false} />
                  <span>Saving...</span>
                </div>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
