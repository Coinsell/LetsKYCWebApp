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
  UserKYCLevel,
  KYCStatus,
  TimeUnit,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { userKycLevelsApi } from "../../lib/userkyclevelsapi";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../../utils/kycStatusConverter";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Search } from "lucide-react";

export function AdminUserKYCLevelsPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
  const [userFilter, setUserFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Levels data
  const [userKycLevels, setUserKycLevels] = useState<UserKYCLevel[]>([]);
  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchUserKycLevels();
  }, []);

  useEffect(() => {
    loadLevelsWithPagination();
  }, [currentPage, pageSize, searchTerm, statusFilter, userFilter, sortField, sortOrder, userId]);

  const fetchUserKycLevels = async () => {
    try {
      setLoading(true);
      console.log("Fetching user KYC levels...");
      
      if (userId) {
        // If filtering by specific user, get their KYC levels
        console.log(`Fetching KYC levels for user: ${userId}`);
        const levels = await userKycLevelsApi.listByUserId(userId);
        console.log("Fetched levels for user:", levels);
        setUserKycLevels(levels);
      } else {
        // If no specific user, get all user KYC levels
        console.log("Fetching all user KYC levels...");
        const levels = await userKycLevelsApi.getAll();
        console.log("Fetched all levels:", levels);
        setUserKycLevels(levels);
      }
    } catch (error) {
      console.error("Error fetching user KYC levels:", error);
      setUserKycLevels([]);
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

      // Add filters
      const filters: FilterCondition[] = [];
      
      // User filter (if specific user is selected)
      if (userId) {
        filters.push({
          field: 'userId',
          operator: FilterOperator.EQUALS,
          value: userId
        });
      } else if (userFilter !== 'all') {
        filters.push({
          field: 'userId',
          operator: FilterOperator.EQUALS,
          value: userFilter
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

      if (filters.length > 0) {
        paginationParams.filters = filters;
      }

      const response: PaginatedResponse<UserKYCLevel> = await userKycLevelsApi.listEnhanced(paginationParams);
      
      setUserKycLevels(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching user KYC levels:', error);
      setUserKycLevels([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, userFilter, sortField, sortOrder, userId]);

  const handleCreate = () => {
    // TODO: Implement create functionality
    console.log("Create new user KYC level");
  };

  const handleEdit = (level: UserKYCLevel) => {
    // TODO: Implement edit functionality
    console.log("Edit user KYC level:", level);
  };

  const handleDelete = async (id: string, userId: string) => {
    if (confirm("Are you sure you want to delete this user KYC level?")) {
      try {
        await userKycLevelsApi.delete(id, userId);
        loadLevelsWithPagination(); // Refresh paginated data
      } catch (error) {
        console.error("Error deleting user KYC level:", error);
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

  const handleUserFilterChange = (value: string) => {
    setUserFilter(value);
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

  const handleViewDetails = (levelId: string) => {
    navigate(`/admin/user-kyc-levels/${levelId}`);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {userId ? `User KYC Levels (User: ${userId})` : "User KYC Levels"}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {userId 
                ? `KYC level assignments for user ${userId}`
                : "Manage user KYC level assignments and their configurations"
              }
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Assign KYC Level
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User KYC Levels</CardTitle>
                <CardDescription>
                  View and manage KYC level assignments for all users
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search user KYC levels..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User Filter (only show if not filtering by specific user) */}
              {!userId && (
                <Select value={userFilter} onValueChange={handleUserFilterChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {/* You can populate this with actual users from state */}
                    {state.users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.login || user.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

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
                  <SelectItem value="userId">User ID</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
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
              Showing {userKycLevels.length} of {totalCount} user KYC levels (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <>
              <div className="space-y-4">
                {userKycLevels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{level.code}</h3>
                      <Badge variant="outline" className="text-xs">
                        User: {level.userId}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(level.status)}`}
                      >
                        {getKycStatusDisplayText(level.status)}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      {level.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        Max Deposit: ${level.maxDepositAmount?.toLocaleString()}
                      </span>
                      <span>
                        Max Withdrawal: ${level.maxWithdrawalAmount?.toLocaleString()}
                      </span>
                      <span>
                        Duration: {level.duration} {level.timeUnit}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-neutral-400">
                      Last Updated: {new Date(level.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(level.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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
                      onClick={() => handleDelete(level.id, level.userId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
                {userKycLevels.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No user KYC levels found</p>
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