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
  ISDCode,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isdCodeApi } from "@/lib/isdcodeapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function ISDCodesPage() {
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
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [editingISDCode, setEditingISDCode] = useState<ISDCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ISD Codes data
  const [isdCodes, setIsdCodes] = useState<ISDCode[]>([]);

  // useEffect(() => {
  //   loadISDCodes();
  // }, []);

  useEffect(() => {
    loadISDCodesWithPagination();
  }, [currentPage, pageSize, searchTerm, countryFilter, sortField, sortOrder]);

  const loadISDCodes = async () => {
    setLoading(true);
    try {
      const isdCodes = await isdCodeApi.list();
      dispatch({ type: "SET_ISD_CODES", payload: isdCodes });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch ISD codes" });
    } finally {
      setLoading(false);
    }
  };

  const loadISDCodesWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Use the GET method like KYCLevelsPage
      const response: PaginatedResponse<ISDCode> = await isdCodeApi.listEnhancedGet(
        currentPage,
        pageSize,
        false, // fetch_all
        searchTerm || undefined,
        sortField,
        sortOrder
      );
      
      setIsdCodes(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error: any) {
      console.error('Error fetching ISD codes:', error);
      setError(error?.message || 'Failed to fetch ISD codes. The ISD codes endpoint is not available on the backend API.');
      dispatch({ type: 'SET_ERROR', payload: error?.message || 'Failed to fetch ISD codes' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, countryFilter, sortField, sortOrder, dispatch]);

  const handleCreate = () => {
    setEditingISDCode(null);
    navigate("/admin/isd-codes/new");
  };

  const handleEdit = (isdCode: ISDCode) => {
    setEditingISDCode(isdCode);
    navigate(`/admin/isd-codes/${isdCode.id}`, { state: { isdCode } });
  };

  // Save (create or update)
  const handleSave = async (isdCode: Partial<ISDCode>) => {
    try {
      if (editingISDCode) {
        const updated = await isdCodeApi.updateById(editingISDCode.id!, {
          ...editingISDCode,
          ...isdCode,
        }, editingISDCode.countryCode);
        dispatch({ type: "UPDATE_ISD_CODE", payload: updated });
      } else {
        const created = await isdCodeApi.create(isdCode as ISDCode);
        dispatch({ type: "ADD_ISD_CODE", payload: created });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save ISD code" });
    }
  };

  // Delete
  const handleDelete = async (id: string, countryCode: string) => {
    if (confirm("Are you sure you want to delete this ISD code?")) {
      try {
        setLoading(true);
        await isdCodeApi.deleteById(id, countryCode);
        dispatch({ type: "DELETE_ISD_CODE", payload: id });
        loadISDCodesWithPagination();
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete ISD code" });
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
            ISD Codes
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage International Subscriber Dialing codes
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add ISD Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>ISD Codes</CardTitle>
                <CardDescription>
                  Configure International Subscriber Dialing codes for different countries
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search ISD codes..."
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
                  <SelectItem value="isdCode">ISD Code</SelectItem>
                  <SelectItem value="countryCode">Country Code</SelectItem>
                  <SelectItem value="countryName">Country Name</SelectItem>
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
              Showing {isdCodes.length} of {totalCount} ISD codes (Page {currentPage} of {totalPages})
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
                    <li>1. Deploy the updated backend with the <code>/isdcodes/</code> routes</li>
                    <li>2. Or implement the ISDCode service and routes in the backend API</li>
                  </ol>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setError(null);
                    loadISDCodesWithPagination();
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
                {isdCodes.map((isdCode) => (
                <div
                  key={isdCode.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{isdCode.countryName}</h3>
                      <Badge variant="outline" className="text-sm">
                        +{isdCode.isdCode}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {isdCode.countryCode}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        {isdCode.countryCode2}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Sequence:</strong> {isdCode.sequence}
                      </span>
                      <span>
                        <strong>ISD Code:</strong> +{isdCode.isdCode}
                      </span>
                      <span>
                        <strong>Country Code:</strong> {isdCode.countryCode}
                      </span>
                      <span>
                        <strong>Country Code 2:</strong> {isdCode.countryCode2}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(isdCode)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(isdCode.id!, isdCode.countryCode)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {isdCodes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No ISD codes found</p>
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
