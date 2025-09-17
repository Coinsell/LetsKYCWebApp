import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Search, Building2, Briefcase, CheckCircle } from "lucide-react";
import { occupationProfessionApi, OccupationProfession } from "../../lib/occupationprofessionapi";
import { useKYC } from "../../contexts/KYCContext";

interface OccupationProfessionStepProps {
  onNext: () => void;
  onBack?: () => void;
  buttonText?: string;
}

export function OccupationProfessionStep({ onNext, onBack, buttonText = "Continue" }: OccupationProfessionStepProps) {
  const { state, dispatch } = useKYC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationProfession | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<OccupationProfession | null>(null);
  const [occupations, setOccupations] = useState<OccupationProfession[]>([]);
  const [professions, setProfessions] = useState<OccupationProfession[]>([]);
  const [searchResults, setSearchResults] = useState<OccupationProfession[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load occupations on component mount
  useEffect(() => {
    loadOccupations();
  }, []);

  // Load professions when occupation is selected
  useEffect(() => {
    if (selectedOccupation) {
      loadProfessions(selectedOccupation.code);
    } else {
      setProfessions([]);
      setSelectedProfession(null);
    }
  }, [selectedOccupation]);

  // Initialize from state if available
  useEffect(() => {
    if (state.occupation) {
      setSelectedOccupation(state.occupation);
    }
    if (state.profession) {
      setSelectedProfession(state.profession);
    }
  }, [state.occupation, state.profession]);

  const loadOccupations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await occupationProfessionApi.listOccupations();
      setOccupations(data);
    } catch (err) {
      setError("Failed to load occupations. Please try again.");
      console.error("Error loading occupations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessions = async (occupationCode: string) => {
    try {
      setLoading(true);
      setError("");
      const data = await occupationProfessionApi.getProfessionsByOccupation(occupationCode);
      setProfessions(data);
    } catch (err) {
      setError("Failed to load professions. Please try again.");
      console.error("Error loading professions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);
      setError("");
      const results = await occupationProfessionApi.search({ q: searchTerm });
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Error searching:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOccupationSelect = (occupation: OccupationProfession) => {
    setSelectedOccupation(occupation);
    setSelectedProfession(null);
    setShowSearchResults(false);
    setSearchTerm("");
    dispatch({ type: 'SET_OCCUPATION', payload: occupation });
  };

  const handleProfessionSelect = (profession: OccupationProfession) => {
    setSelectedProfession(profession);
    dispatch({ type: 'SET_PROFESSION', payload: profession });
  };

  const handleSearchResultSelect = (item: OccupationProfession) => {
    if (item.docType === 'Occupation') {
      handleOccupationSelect(item);
    } else {
      // If it's a profession, we need to find its parent occupation
      const parentOccupation = occupations.find(occ => occ.code === item.occupationCode);
      if (parentOccupation) {
        setSelectedOccupation(parentOccupation);
        setSelectedProfession(item);
        dispatch({ type: 'SET_OCCUPATION', payload: parentOccupation });
        dispatch({ type: 'SET_PROFESSION', payload: item });
      }
    }
    setShowSearchResults(false);
    setSearchTerm("");
  };

  const handleNext = () => {
    if (!selectedOccupation) {
      setError("Please select an occupation");
      return;
    }
    onNext();
  };

  const isComplete = selectedOccupation && (selectedProfession || professions.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Occupation & Profession
        </CardTitle>
        <CardDescription>
          Please select your occupation and profession to complete your KYC verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Search Occupations & Professions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="search"
                  placeholder="Search for your occupation or profession..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={!searchTerm.trim() || isSearching}
                variant="outline"
              >
                {isSearching ? <LoadingSpinner fullscreen={false} /> : "Search"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="border rounded-lg bg-neutral-50 dark:bg-neutral-800 max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">
                  No results found for "{searchTerm}"
                </div>
              ) : (
                <div className="divide-y">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchResultSelect(item)}
                      className="w-full p-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {item.docType === 'Occupation' ? (
                          <Building2 className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Briefcase className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-neutral-500">
                            {item.docType === 'Profession' && item.occupationName && (
                              <span>{item.occupationName} • </span>
                            )}
                            {item.docType}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Occupation Selection */}
        <div className="space-y-3">
          <Label>Select Occupation</Label>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner fullscreen={false} />
              <span className="ml-2">Loading occupations...</span>
            </div>
          ) : (
            <Select
              value={selectedOccupation?.code || ""}
              onValueChange={(value) => {
                const occupation = occupations.find(occ => occ.code === value);
                if (occupation) {
                  handleOccupationSelect(occupation);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your occupation..." />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occupation) => (
                  <SelectItem key={occupation.code} value={occupation.code}>
                    {occupation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Profession Selection */}
        {selectedOccupation && professions.length > 0 && (
          <div className="space-y-3">
            <Label>Select Profession (Optional)</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoadingSpinner fullscreen={false} />
                <span className="ml-2">Loading professions...</span>
              </div>
            ) : (
              <Select
                value={selectedProfession?.code || ""}
                onValueChange={(value) => {
                  const profession = professions.find(prof => prof.code === value);
                  if (profession) {
                    handleProfessionSelect(profession);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your specific profession..." />
                </SelectTrigger>
                <SelectContent>
                  {professions.map((profession) => (
                    <SelectItem key={profession.code} value={profession.code}>
                      {profession.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Selected Information Display */}
        {selectedOccupation && (
          <div className="p-4 bg-primary-1/5 dark:bg-primary-1/10 rounded-lg border border-primary-1/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Selected Information</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Occupation:</span> {selectedOccupation.name}
              </p>
              {selectedProfession && (
                <p className="text-sm">
                  <span className="font-medium">Profession:</span> {selectedProfession.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={!isComplete}
            className={!onBack ? "ml-auto" : ""}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
