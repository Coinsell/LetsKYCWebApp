import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingSpinner } from "../ui/loading-spinner";
import { countryApi, Country } from "../../lib/countryapi";
import { provinceApi, Province } from "../../lib/provinceapi";
import { cityApi, City } from "../../lib/cityapi";
import { useKYC } from "../../contexts/KYCContext";

interface AddressStepProps {
  onNext: () => void;
  onBack?: () => void;
  onComplete: () => void;
  buttonText?: string;
}

export function AddressStep({ onNext, onBack, onComplete, buttonText = "Continue" }: AddressStepProps) {
  console.log('AddressStep props:', { onNext: !!onNext, onBack: !!onBack, onComplete: !!onComplete, buttonText });
  const { state, dispatch } = useKYC();
  
  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Initialize form data from KYC context
  useEffect(() => {
    if (state.userInfo) {
      setFormData({
        addressLine1: state.userInfo.addressLine1 || "",
        addressLine2: state.userInfo.addressLine2 || "",
        city: state.userInfo.city || "",
        state: state.userInfo.state || "",
        postalCode: state.userInfo.pincode || "",
        country: state.userInfo.country || "",
      });
    }
  }, [state.userInfo]);

  // Load provinces when country changes
  useEffect(() => {
    if (formData.country) {
      loadProvinces(formData.country);
    } else {
      setProvinces([]);
      setCities([]);
    }
  }, [formData.country]);

  // Load cities when province changes
  useEffect(() => {
    if (formData.state && formData.country) {
      loadCities(formData.country, formData.state);
    } else {
      setCities([]);
    }
  }, [formData.state, formData.country]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const countriesData = await countryApi.list();
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
      // Fallback to common countries
      setCountries([
        { id: '1', sequence: 1, code: 'US', name: 'United States', isRegistrationRestricted: false },
        { id: '2', sequence: 2, code: 'CA', name: 'Canada', isRegistrationRestricted: false },
        { id: '3', sequence: 3, code: 'GB', name: 'United Kingdom', isRegistrationRestricted: false },
        { id: '4', sequence: 4, code: 'AU', name: 'Australia', isRegistrationRestricted: false },
        { id: '5', sequence: 5, code: 'IN', name: 'India', isRegistrationRestricted: false },
        { id: '6', sequence: 6, code: 'DE', name: 'Germany', isRegistrationRestricted: false },
        { id: '7', sequence: 7, code: 'FR', name: 'France', isRegistrationRestricted: false },
        { id: '8', sequence: 8, code: 'JP', name: 'Japan', isRegistrationRestricted: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async (countryCode: string) => {
    try {
      setLoadingProvinces(true);
      const provincesData = await provinceApi.getByCountry(countryCode);
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadCities = async (countryCode: string, provinceCode: string) => {
    try {
      setLoadingCities(true);
      const citiesData = await cityApi.getByProvince(countryCode, provinceCode);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Address submitted:", formData);
      onComplete();
      onNext();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>
          Please provide your current residential address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange("addressLine1", e.target.value)}
              placeholder="Street address, P.O. box, company name"
              className={errors.addressLine1 ? "border-red-500" : ""}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange("addressLine2", e.target.value)}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State or Province"
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange("postalCode", e.target.value)}
                placeholder="Postal or ZIP code"
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button type="submit" className={!onBack ? "ml-auto" : ""}>
              {buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
