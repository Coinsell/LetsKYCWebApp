import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  useKYCAdmin,
  Country,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { countryApi } from "@/lib/countryapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function CountriesPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [restrictionFilter, setRestrictionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Countries data
  const [countries, setCountries] = useState<Country[]>([]);

  // useEffect(() => {
  //   loadCountries();
  // }, []);

  useEffect(() => {
    loadCountriesWithPagination();
  }, [currentPage, pageSize, searchTerm, restrictionFilter, sortField, sortOrder]);

  const loadCountries = async () => {
    setLoading(true);
    try {
      const countries = await countryApi.list();
      dispatch({ type: "SET_COUNTRIES", payload: countries });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch countries" });
    } finally {
      setLoading(false);
    }
  };

  const loadCountriesWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Use the GET method like KYCLevelsPage
      const response: PaginatedResponse<Country> = await countryApi.listEnhancedGet(
        currentPage,
        pageSize,
        false, // fetch_all
        searchTerm || undefined,
        sortField,
        sortOrder
      );
      
      setCountries(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      setError(error?.message || 'Failed to fetch countries');
      dispatch({ type: 'SET_ERROR', payload: error?.message || 'Failed to fetch countries' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, restrictionFilter, sortField, sortOrder, dispatch]);

  const handleCreate = () => {
    navigate("/admin/countries/new");
  };

  const handleEdit = (country: Country) => {
    navigate(`/admin/countries/${country.code}`);
  };

  // Save (create or update)
  const handleSave = async (country: Partial<Country>) => {
    try {
      if (editingCountry) {
        const updated = await countryApi.updateByCode(editingCountry.code, {
          ...editingCountry,
          ...country,
        });
        dispatch({ type: "UPDATE_COUNTRY", payload: updated });
      } else {
        const created = await countryApi.create(country as Country);
        dispatch({ type: "ADD_COUNTRY", payload: created });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save country" });
    }
  };

  // Delete
  const handleDelete = async (code: string) => {
    if (confirm("Are you sure you want to delete this country?")) {
      try {
        setLoading(true);
        await countryApi.deleteByCode(code);
        dispatch({ type: "DELETE_COUNTRY", payload: code });
        loadCountriesWithPagination();
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete country" });
      } finally {
        setLoading(false);
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRestrictionFilterChange = (value: string) => {
    setRestrictionFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (field: string) => {
    setSortField(field);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    setCurrentPage(1); // Reset to first page when changing sort order
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Countries
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage countries and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Country
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Countries</CardTitle>
                <CardDescription>
                  Configure different countries for user registration
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Restriction Filter */}
              <Select value={restrictionFilter} onValueChange={handleRestrictionFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Registration Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="unrestricted">Unrestricted</SelectItem>
                </SelectContent>
              </Select>

              {/* Page Size */}
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Field */}
              <Select value={sortField} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequence">Sequence</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="isRegistrationRestricted">Restriction</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="flex items-center gap-2"
              >
                {sortOrder === SortOrder.ASC ? '↑' : '↓'} {sortOrder}
              </Button>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {countries.length} of {totalCount} countries (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <h3 className="text-lg font-semibold mb-2">Error Loading Countries</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button 
                onClick={() => {
                  setError(null);
                  loadCountriesWithPagination();
                }}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <>
              <div className="space-y-4">
                {countries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{country.name}</h3>
                      <Badge variant="outline" className="text-sm">
                        {country.code}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          country.isRegistrationRestricted 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {country.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Sequence:</strong> {country.sequence}
                      </span>
                      <span>
                        <strong>Code:</strong> {country.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(country)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(country.code)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {countries.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No countries found</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!hasPrevious}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={!hasNext}
                    >
                      Last
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
