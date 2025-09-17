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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { occupationProfessionApi } from "@/lib/occupationprofessionapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ProfessionsPage() {
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
  const [occupationFilter, setOccupationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [editingProfession, setEditingProfession] = useState<OccupationProfession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Professions data
  const [professions, setProfessions] = useState<OccupationProfession[]>([]);

  useEffect(() => {
    loadProfessionsWithPagination();
  }, [currentPage, pageSize, searchTerm, occupationFilter, statusFilter, sortField, sortOrder]);

  const loadProfessions = async () => {
    setLoading(true);
    try {
      const professions = await occupationProfessionApi.listProfessions();
      dispatch({ type: "SET_PROFESSIONS", payload: professions });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch professions" });
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionsWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Use the GET method like KYCLevelsPage
      const response: PaginatedResponse<OccupationProfession> = await occupationProfessionApi.listProfessionsEnhancedGet(
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
      
      setProfessions(sortedItems);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error: any) {
      console.error('Error fetching professions:', error);
      setError(error?.message || 'Failed to fetch professions. The professions endpoint is not available on the backend API.');
      dispatch({ type: 'SET_ERROR', payload: error?.message || 'Failed to fetch professions' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, occupationFilter, statusFilter, sortField, sortOrder, dispatch]);

  const handleCreate = () => {
    navigate("/admin/professions/new");
  };

  const handleEdit = (profession: OccupationProfession) => {
    navigate(`/admin/professions/${profession.code}`);
  };

  const handleBackToOccupations = () => {
    navigate("/admin/occupations");
  };

  // Save (create or update)
  const handleSave = async (profession: Partial<OccupationProfession>) => {
    try {
      if (editingProfession) {
        // Update logic would go here
        dispatch({ type: "UPDATE_PROFESSION", payload: profession as OccupationProfession });
      } else {
        // Create logic would go here
        dispatch({ type: "ADD_PROFESSION", payload: profession as OccupationProfession });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save profession" });
    }
  };

  // Delete
  const handleDelete = async (code: string) => {
    if (confirm("Are you sure you want to delete this profession?")) {
      try {
        setLoading(true);
        await occupationProfessionApi.deleteProfession(code);
        dispatch({ type: "DELETE_PROFESSION", payload: code });
        loadProfessionsWithPagination();
      } catch (error: any) {
        console.error('Error deleting profession:', error);
        setError(error?.message || "Failed to delete profession");
        dispatch({ type: "SET_ERROR", payload: error?.message || "Failed to delete profession" });
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

  const handleOccupationFilterChange = (value: string) => {
    setOccupationFilter(value);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBackToOccupations}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Occupations
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Professions
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage professions and their configurations
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Profession
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Professions</CardTitle>
                <CardDescription>
                  Configure different professions for user registration
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search professions..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Occupation Filter */}
              <Select value={occupationFilter} onValueChange={handleOccupationFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occupations</SelectItem>
                  {/* Add occupation options dynamically */}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-48">
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
                  <SelectItem value="occupationCode">Occupation</SelectItem>
                  <SelectItem value="jobLevel">Job Level</SelectItem>
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
              Showing {professions.length} of {totalCount} professions (Page {currentPage} of {totalPages})
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
                    <li>2. Or implement the Profession service and routes in the backend API</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setError(null);
                    loadProfessionsWithPagination();
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
                {professions.map((profession) => (
                <div
                  key={profession.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{profession.name}</h3>
                      <Badge variant="outline" className="text-sm">
                        {profession.code}
                      </Badge>
                      {profession.occupationName && (
                        <Badge variant="secondary" className="text-sm">
                          {profession.occupationName}
                        </Badge>
                      )}
                      {profession.jobLevel && (
                        <Badge variant="secondary" className="text-sm">
                          {profession.jobLevel}
                        </Badge>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profession.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {profession.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {profession.jobTitle && (
                      <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                        {profession.jobTitle}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Sequence:</strong> {profession.sequence}
                      </span>
                      <span>
                        <strong>Code:</strong> {profession.code}
                      </span>
                      {profession.occupationCode && (
                        <span>
                          <strong>Occupation:</strong> {profession.occupationCode}
                        </span>
                      )}
                      {profession.requiredEducation && (
                        <span>
                          <strong>Education:</strong> {profession.requiredEducation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(profession)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(profession.code)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {professions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No professions found</p>
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
