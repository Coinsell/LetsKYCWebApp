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
  City,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cityApi } from "@/lib/cityapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function CitiesPage() {
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
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [restrictionFilter, setRestrictionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Cities data
  const [cities, setCities] = useState<City[]>([]);

  // useEffect(() => {
  //   loadCities();
  // }, []);

  useEffect(() => {
    loadCitiesWithPagination();
  }, [currentPage, pageSize, searchTerm, countryFilter, provinceFilter, restrictionFilter, sortField, sortOrder]);

  const loadCities = async () => {
    setLoading(true);
    try {
      const cities = await cityApi.list();
      dispatch({ type: "SET_CITIES", payload: cities });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch cities" });
    } finally {
      setLoading(false);
    }
  };

  const loadCitiesWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Use the GET method like KYCLevelsPage
      const response: PaginatedResponse<City> = await cityApi.listEnhancedGet(
        currentPage,
        pageSize,
        false, // fetch_all
        searchTerm || undefined,
        sortField,
        sortOrder
      );
      
      setCities(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      setError(error?.message || 'Failed to fetch cities. The cities endpoint is not available on the backend API.');
      dispatch({ type: 'SET_ERROR', payload: error?.message || 'Failed to fetch cities' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, countryFilter, provinceFilter, restrictionFilter, sortField, sortOrder, dispatch]);

  const handleCreate = () => {
    setEditingCity(null);
    navigate("/admin/cities/new");
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    navigate(`/admin/cities/${city.code}`, { state: { city } });
  };

  // Save (create or update)
  const handleSave = async (city: Partial<City>) => {
    try {
      if (editingCity) {
        const updated = await cityApi.updateByCode(editingCity.code, {
          ...editingCity,
          ...city,
        });
        dispatch({ type: "UPDATE_CITY", payload: updated });
      } else {
        const created = await cityApi.create(city as City);
        dispatch({ type: "ADD_CITY", payload: created });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save city" });
    }
  };

  // Delete
  const handleDelete = async (code: string) => {
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        setLoading(true);
        await cityApi.deleteByCode(code);
        dispatch({ type: "DELETE_CITY", payload: code });
        loadCitiesWithPagination();
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete city" });
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

  const handleCountryFilterChange = (value: string) => {
    setCountryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleProvinceFilterChange = (value: string) => {
    setProvinceFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
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
            Cities
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage cities and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add City
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cities</CardTitle>
                <CardDescription>
                  Configure different cities for user registration
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search cities..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <Select value={countryFilter} onValueChange={handleCountryFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {/* Add country options dynamically */}
                </SelectContent>
              </Select>

              {/* Province Filter */}
              <Select value={provinceFilter} onValueChange={handleProvinceFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Provinces</SelectItem>
                  {/* Add province options dynamically */}
                </SelectContent>
              </Select>

              {/* Restriction Filter */}
              <Select value={restrictionFilter} onValueChange={handleRestrictionFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Registration Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
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
                  <SelectItem value="countryCode">Country</SelectItem>
                  <SelectItem value="provinceCode">Province</SelectItem>
                  <SelectItem value="cityType">Type</SelectItem>
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
              Showing {cities.length} of {totalCount} cities (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <>
              <div className="space-y-4">
                {cities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{city.name}</h3>
                      <Badge variant="outline" className="text-sm">
                        {city.code}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {city.countryCode}
                      </Badge>
                      {city.provinceCode && (
                        <Badge variant="secondary" className="text-sm">
                          {city.provinceCode}
                        </Badge>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          city.isRegistrationRestricted 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {city.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Sequence:</strong> {city.sequence}
                      </span>
                      <span>
                        <strong>Type:</strong> {city.cityType}
                      </span>
                      <span>
                        <strong>Country:</strong> {city.countryName}
                      </span>
                      {city.provinceName && (
                        <span>
                          <strong>Province:</strong> {city.provinceName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(city)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(city.code)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {cities.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No cities found</p>
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
