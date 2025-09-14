import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  useKYCAdmin,
  KYCDetail,
  KYCStatus,
  KycDetailType,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Layers, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { kycDetailsApi } from "../lib/kycdetailsapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useParams, useNavigate } from "react-router-dom";
import { getKycStatusDisplayText, getKycStatusColor } from "../utils/kycStatusConverter";

export function KYCDetailsPage() {
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
  const [selectedKycLevel, setSelectedKycLevel] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('step');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Details data
  const [details, setDetails] = useState<KYCDetail[]>([]);

  useEffect(() => {
    fetchKYCDetails();
  }, []);

  useEffect(() => {
    loadDetailsWithPagination();
  }, [currentPage, pageSize, searchTerm, selectedKycLevel, statusFilter, typeFilter, sortField, sortOrder]);

  const fetchKYCDetails = async () => {
    setLoading(true);
    try {
      const details = await kycDetailsApi.getAll();
      dispatch({ type: "SET_KYC_DETAILS", payload: details });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC details" });
    } finally {
      setLoading(false);
    }
  };

  const loadDetailsWithPagination = useCallback(async () => {
    setLoading(true);
    try {
      // Build pagination parameters
      const paginationParams: PaginationParams = {
        page: currentPage,
        page_size: pageSize,
        fetch_all: false,
        search: searchTerm || undefined,
        sort_by: [
          {
            field: sortField,
            order: sortOrder
          }
        ]
      }

      // Add filters
      const filters: FilterCondition[] = [];
      
      // KYC Level filter
      if (selectedKycLevel !== 'all') {
        filters.push({
          field: 'kycLevelId',
          operator: FilterOperator.EQUALS,
          value: selectedKycLevel
        });
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        filters.push({
          field: 'status',
          operator: FilterOperator.EQUALS,
          value: statusFilter
        });
      }
      
      // Type filter
      if (typeFilter !== 'all') {
        filters.push({
          field: 'type',
          operator: FilterOperator.EQUALS,
          value: typeFilter
        });
      }

      if (filters.length > 0) {
        paginationParams.filters = filters;
      }

      const response: PaginatedResponse<KYCDetail> = await kycDetailsApi.listEnhanced(paginationParams);
      
      setDetails(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching KYC details:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch KYC details' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, selectedKycLevel, statusFilter, typeFilter, sortField, sortOrder, dispatch]);

  const handleDelete = async (id: string, kycLevelId: string) => {
    if (confirm("Are you sure you want to delete this KYC detail?")) {
      try {
        await kycDetailsApi.delete(id, kycLevelId);
        dispatch({ type: "DELETE_KYC_DETAIL", payload: id });
        loadDetailsWithPagination(); // Refresh paginated data
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC detail" });
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

  const handleKycLevelFilterChange = (value: string) => {
    setSelectedKycLevel(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
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

  const moveSequence = (id: string, direction: "up" | "down") => {
    const detail = details.find((d) => d.id === id);
    if (!detail) return;

    const sameLevelDetails = details
      .filter((d) => d.kycLevelId === detail.kycLevelId)
      .sort((a, b) => a.sequence - b.sequence);

    const currentIndex = sameLevelDetails.findIndex((d) => d.id === id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sameLevelDetails.length) return;

    // Swap sequences
    const updatedDetail = {
      ...detail,
      sequence: sameLevelDetails[targetIndex].sequence,
    };
    const updatedTarget = {
      ...sameLevelDetails[targetIndex],
      sequence: detail.sequence,
    };

    // NOTE: You may want to persist these swaps with an API update
    dispatch({ type: "UPDATE_KYC_DETAIL", payload: updatedDetail });
    dispatch({ type: "UPDATE_KYC_DETAIL", payload: updatedTarget });
    
    // Refresh paginated data after sequence change
    loadDetailsWithPagination();
  };

  const getKycLevelName = (kycLevelId: string) => {
    const level = state.kycLevels.find((l) => l.kycLevelId === kycLevelId);
    return level ? level.code : kycLevelId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">KYC Details</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage KYC steps and requirements for each level
          </p>
        </div>

        <Button className="gap-2" onClick={() => navigate("/admin/kyc-levels")}>
          <Layers className="h-4 w-4" />
          Manage KYC Levels
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Details</CardTitle>
                <CardDescription>
                  Configure steps for each KYC level
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search details..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* KYC Level Filter */}
              <Select
                value={selectedKycLevel}
                onValueChange={handleKycLevelFilterChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by KYC Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {state.kycLevels.map((level) => (
                    <SelectItem key={level.kycLevelId} value={level.kycLevelId}>
                      {level.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Verification">Verification</SelectItem>
                  <SelectItem value="Biometric">Biometric</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                  <SelectItem value="step">Step</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="sequence">Sequence</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
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
              Showing {details.length} of {totalCount} details (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <>
              <div className="space-y-4">
                {details.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getKycLevelName(detail.kycLevelId)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Step {detail.sequence}
                      </Badge>
                      <h3 className="font-semibold text-lg">{detail.step}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(detail.status)}`}
                      >
                        {getKycStatusDisplayText(detail.status)}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-2">
                      {detail.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>Type: {detail.type}</span>
                      <span>
                        Attachments:{" "}
                        {detail.hasAttachments ? "Required" : "Not Required"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSequence(detail.id, "up")}
                      disabled={detail.sequence === 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSequence(detail.id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(detail.id, detail.kycLevelId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {details.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No KYC details found</p>
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
