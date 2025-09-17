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
  OccupationProfession,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { occupationProfessionApi } from "@/lib/occupationprofessionapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function OccupationsPage() {
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [editingOccupation, setEditingOccupation] = useState<OccupationProfession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Occupations data
  const [occupations, setOccupations] = useState<OccupationProfession[]>([]);

  useEffect(() => {
    loadOccupationsWithPagination();
  }, [currentPage, pageSize, searchTerm, categoryFilter, statusFilter, sortField, sortOrder]);

  const loadOccupations = async () => {
    setLoading(true);
    try {
      const occupations = await occupationProfessionApi.listOccupations();
      dispatch({ type: "SET_OCCUPATIONS", payload: occupations });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch occupations" });
    } finally {
      setLoading(false);
    }
  };

  const loadOccupationsWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Use the GET method like KYCLevelsPage
      const response: PaginatedResponse<OccupationProfession> = await occupationProfessionApi.listOccupationsEnhancedGet(
        currentPage,
        pageSize,
        false, // fetch_all
        searchTerm || undefined,
        undefined, // Don't send sort_field to avoid Cosmos DB issues
        undefined  // Don't send sort_order to avoid Cosmos DB issues
      );
      
      // Apply client-side sorting as a workaround for backend ORDER BY issues
      // TODO: Remove this workaround once backend ORDER BY issues are resolved
      let sortedItems = [...response.items];
      if (sortField && sortOrder) {
        try {
          sortedItems.sort((a, b) => {
            let aValue = a[sortField as keyof OccupationProfession];
            let bValue = b[sortField as keyof OccupationProfession];
            
            // Handle undefined/null values
            if (aValue === undefined || aValue === null) aValue = '';
            if (bValue === undefined || bValue === null) bValue = '';
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return sortOrder === SortOrder.ASC ? -1 : 1;
            if (aValue > bValue) return sortOrder === SortOrder.ASC ? 1 : -1;
            return 0;
          });
        } catch (sortError) {
          console.warn('Client-side sorting failed, using unsorted data:', sortError);
          // Keep original order if sorting fails
        }
      }
      
      setOccupations(sortedItems);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error: any) {
      console.error('Error fetching occupations:', error);
      setError(error?.message || 'Failed to fetch occupations. The occupations endpoint is not available on the backend API.');
      dispatch({ type: 'SET_ERROR', payload: error?.message || 'Failed to fetch occupations' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, categoryFilter, statusFilter, sortField, sortOrder, dispatch]);

  const handleCreate = () => {
    navigate("/admin/occupations/new");
  };

  const handleEdit = (occupation: OccupationProfession) => {
    navigate(`/admin/occupations/${occupation.code}`);
  };

  const handleViewProfessions = (occupation: OccupationProfession) => {
    navigate(`/admin/occupations/${occupation.code}/professions`);
  };

  // Save (create or update)
  const handleSave = async (occupation: Partial<OccupationProfession>) => {
    try {
      if (editingOccupation) {
        // Update logic would go here
        dispatch({ type: "UPDATE_OCCUPATION", payload: occupation as OccupationProfession });
      } else {
        // Create logic would go here
        dispatch({ type: "ADD_OCCUPATION", payload: occupation as OccupationProfession });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save occupation" });
    }
  };

  // Delete
  const handleDelete = async (code: string) => {
    if (confirm("Are you sure you want to delete this occupation?")) {
      try {
        setLoading(true);
        await occupationProfessionApi.deleteOccupation(code);
        dispatch({ type: "DELETE_OCCUPATION", payload: code });
        loadOccupationsWithPagination();
      } catch (error: any) {
        console.error('Error deleting occupation:', error);
        setError(error?.message || "Failed to delete occupation");
        dispatch({ type: "SET_ERROR", payload: error?.message || "Failed to delete occupation" });
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

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Occupations
          </h1>
          <p className="mt-1 sm:mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage occupations and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Occupation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Occupations</CardTitle>
                <CardDescription>
                  Configure different occupations for user registration
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search occupations..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {/* Add category options dynamically */}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Page Size */}
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 sm:w-24">
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
                  <SelectTrigger className="w-28 sm:w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {sortOrder === SortOrder.ASC ? '↑' : '↓'} {sortOrder}
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {occupations.length} of {totalCount} occupations (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <div className="text-orange-600 dark:text-orange-400 mb-6">
                <h3 className="text-lg font-semibold mb-2">⚠️ Backend Endpoint Missing</h3>
                <p className="text-sm mb-4">{error}</p>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium mb-2">To fix this issue:</p>
                  <ol className="text-left text-sm space-y-1">
                    <li>1. Deploy the updated backend with the <code>/occupations-professions/</code> routes</li>
                    <li>2. Or implement the Occupation service and routes in the backend API</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setError(null);
                    loadOccupationsWithPagination();
                  }}
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => window.open('https://letskycapi.agreeabledune-9ad96245.southeastasia.azurecontainerapps.io/docs', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  View API Docs
                </Button>
              </div>
            </div>
          ) : loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <>
              <div className="space-y-4">
                {occupations.map((occupation) => (
                <div
                  key={occupation.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">{occupation.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-sm">
                          {occupation.code}
                        </Badge>
                        {occupation.category && (
                          <Badge variant="secondary" className="text-sm">
                            {occupation.category}
                          </Badge>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            occupation.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {occupation.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {occupation.description && (
                      <p className="text-neutral-600 dark:text-neutral-400 mb-2 text-sm sm:text-base">
                        {occupation.description}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm text-neutral-500">
                      <span>
                        <strong>Sequence:</strong> {occupation.sequence}
                      </span>
                      <span>
                        <strong>Code:</strong> {occupation.code}
                      </span>
                      {occupation.category && (
                        <span>
                          <strong>Category:</strong> {occupation.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfessions(occupation)}
                      title="View Professions"
                      className="flex-1 sm:flex-none"
                    >
                      <Users className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden">Professions</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(occupation)}
                      className="flex-1 sm:flex-none"
                    >
                      <Pencil className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(occupation.code)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-2" />
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
                {occupations.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No occupations found</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 gap-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!hasPrevious}
                      className="hidden sm:flex"
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
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={!hasNext}
                      className="hidden sm:flex"
                    >
                      Last
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
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
