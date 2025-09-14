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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  useKYCAdmin,
  KYCLevel,
  KYCStatus,
  TimeUnit,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { kycLevelsApi } from "../lib/kyclevelsapi";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../utils/kycStatusConverter";

export function KYCLevelsPage() {
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<KYCLevel | null>(null);
  
  // Levels data
  const [levels, setLevels] = useState<KYCLevel[]>([]);

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    loadLevelsWithPagination();
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder]);

  const loadLevels = async () => {
    try {
      setLoading(true);
      const levels = await kycLevelsApi.list();
      dispatch({ type: "SET_KYC_LEVELS", payload: levels });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC levels" });
    } finally {
      setLoading(false);
    }
  };

  const loadLevelsWithPagination = useCallback(async () => {
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

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        paginationParams.filters = [
          {
            field: 'status',
            operator: FilterOperator.EQUALS,
            value: statusFilter
          }
        ]
      }

      const response: PaginatedResponse<KYCLevel> = await kycLevelsApi.listEnhanced(paginationParams);
      
      setLevels(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching KYC levels:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch KYC levels' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder, dispatch]);

  const fetchKYCLevels = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const levels = await kycLevelsApi.list();
      dispatch({ type: "SET_KYC_LEVELS", payload: levels });
    } catch (error) {
      console.error("Error fetching KYC levels:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC levels" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleCreate = () => {
    setEditingLevel(null);
    navigate("/admin/kyc-levels/new");
  };

  const handleEdit = (level: KYCLevel) => {
    setEditingLevel(level);
    console.log("Inside Handle Edit");
    navigate(`/admin/kyc-levels/${level.id}`, { state: { level } });
  };

  const handleSave = async (level: Partial<KYCLevel>) => {
    try {
      if (editingLevel) {
        const updated = await kycLevelsApi.update(editingLevel.id, {
          ...editingLevel,
          ...level,
        });
        dispatch({ type: "UPDATE_KYC_LEVEL", payload: updated });
      } else {
        const created = await kycLevelsApi.create(level);
        dispatch({ type: "ADD_KYC_LEVEL", payload: created });
      }
      setIsModalOpen(false);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save KYC level" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this KYC level?")) {
      try {
        setLoading(true);
        await kycLevelsApi.deleteWithDetails(id);
        dispatch({ type: "DELETE_KYC_LEVEL", payload: id });
        loadLevelsWithPagination();
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC level" });
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

  // const handleDelete = async (id: string) => {
  //   if (confirm("Are you sure you want to delete this KYC level?")) {
  //     try {
  //       // Mock API call - replace with actual API
  //       dispatch({ type: "DELETE_KYC_LEVEL", payload: id });
  //     } catch (error) {
  //       dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC level" });
  //     }
  //   }
  // };

  // const handleSave = async (level: Partial<KYCLevel>) => {
  //   try {
  //     if (editingLevel) {
  //       // Update existing level
  //       const updatedLevel = { ...editingLevel, ...level };
  //       dispatch({ type: "UPDATE_KYC_LEVEL", payload: updatedLevel });
  //     } else {
  //       // Create new level
  //       const newLevel: KYCLevel = {
  //         id: Date.now().toString(),
  //         kycLevelId: `kyc-level-${Date.now()}`,
  //         ...level,
  //       } as KYCLevel;
  //       dispatch({ type: "ADD_KYC_LEVEL", payload: newLevel });
  //     }
  //     setIsModalOpen(false);
  //   } catch (error) {
  //     dispatch({ type: "SET_ERROR", payload: "Failed to save KYC level" });
  //   }
  // };

  // show spinner when loading
  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">KYC Levels</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage KYC levels and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add KYC Level
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Levels</CardTitle>
                <CardDescription>
                  Configure different KYC levels for users
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search levels..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

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
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="maxDepositAmount">Max Deposit</SelectItem>
                  <SelectItem value="maxWithdrawalAmount">Max Withdrawal</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
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
              Showing {levels.length} of {totalCount} levels (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{level.code}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(level.status)}`}
                    >
                      {getKycStatusDisplayText(level.status)}
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-2">{level.description}</p>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span>
                      Max Deposit: ${level.maxDepositAmount?.toLocaleString()}
                    </span>
                    <span>
                      Max Withdrawal: $
                      {level.maxWithdrawalAmount?.toLocaleString()}
                    </span>
                    <span>
                      Duration: {level.duration} {level.timeUnit}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(level)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(level.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {levels.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500">No KYC levels found</p>
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
        </CardContent>
      </Card>

      {/* <KYCLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        level={editingLevel}
      /> */}
    </div>
  );
}
