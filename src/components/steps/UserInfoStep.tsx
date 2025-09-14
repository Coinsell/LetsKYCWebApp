import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useKYC, UserInfo } from "../../contexts/KYCContext";

import { api } from "../../lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { mapFormDataToUser } from "@/utils/mappers/mapFormDataToUser";
import { User } from "@/contexts/KYCAdminContext";

interface UserInfoStepProps {
  onNext: () => void;
  buttonText?: string;
}

export function UserInfoStep({ onNext, buttonText = "Continue" }: UserInfoStepProps) {
  const { dispatch } = useKYC();
  const { user: authUser } = useAuth();
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

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateForm = () => {
    const newErrors: Partial<UserInfo> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Address line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!formData.pan.trim()) {
      newErrors.pan = "PAN is required";
    } else if (!validatePAN(formData.pan)) {
      newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Invalid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const mappedUser = mapFormDataToUser(formData, authUser);
      const result = await api.post<{ user: UserInfo }>(
        `/users/users/${mappedUser.id}`,
        mappedUser
      );

      if (result) {
        // Update KYC context (your form flow)
        dispatch({ type: "SET_USER_INFO", payload: formData });

        // Update KYCAdmin context (admin state)
        //adminDispatch({ type: "ADD_USER", payload: result });

        onNext();
      }
    } catch (err) {
      console.error("API error:", err);
    }
    console.log("After OnNext");
    console.log("Form Data: " + formData);
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
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

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              {buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
