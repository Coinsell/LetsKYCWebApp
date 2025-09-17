import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
} from "../contexts/KYCAdminContext";
import { userKycLevelsApi } from "../lib/userkyclevelsapi";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../utils/kycStatusConverter";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";

export function UserKYCLevelsPage() {
  const { user } = useAuth();
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
  
  // Levels data
  const [userKycLevels, setUserKycLevels] = useState<UserKYCLevel[]>([]);

  // useEffect(() => {
  //   fetchUserKycLevels();
  // }, []);

  useEffect(() => {
    loadLevelsWithPagination();
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder, user?.id]);

  const fetchUserKycLevels = async () => {
    try {
      setLoading(true);
      const currentUserId = user?.id || "current-user-id";
      
      // Try to fetch real data first
      try {
        const levels = await userKycLevelsApi.listByUserId(currentUserId);
        setUserKycLevels(levels);
        return;
      } catch (apiError) {
        console.log("API not available, using mock data:", apiError);
      }
      
      // Fallback to comprehensive mock data
      const mockUserKycLevels: UserKYCLevel[] = [
        {
          id: "user-kyc-level-1",
          userId: currentUserId,
          userKycLevelId: "kyc-level-1",
          code: "BASIC",
          description: "Basic KYC Level - Limited transactions and basic verification",
          status: KYCStatus.Approved,
          maxDepositAmount: 10000,
          maxWithdrawalAmount: 5000,
          duration: 30,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-2",
          userId: currentUserId,
          userKycLevelId: "kyc-level-2",
          code: "ENHANCED",
          description: "Enhanced KYC Level - Higher limits with additional verification",
          status: KYCStatus.InProgress,
          maxDepositAmount: 50000,
          maxWithdrawalAmount: 25000,
          duration: 90,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-3",
          userId: currentUserId,
          userKycLevelId: "kyc-level-3",
          code: "PREMIUM",
          description: "Premium KYC Level - Maximum limits with full verification",
          status: KYCStatus.UnderReview,
          maxDepositAmount: 100000,
          maxWithdrawalAmount: 50000,
          duration: 180,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-4",
          userId: currentUserId,
          userKycLevelId: "kyc-level-4",
          code: "VIP",
          description: "VIP KYC Level - Unlimited transactions with premium support",
          status: KYCStatus.Submitted,
          maxDepositAmount: 500000,
          maxWithdrawalAmount: 250000,
          duration: 365,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-5",
          userId: currentUserId,
          userKycLevelId: "kyc-level-5",
          code: "ENTERPRISE",
          description: "Enterprise KYC Level - Corporate accounts with custom limits",
          status: KYCStatus.NotSubmitted,
          maxDepositAmount: 1000000,
          maxWithdrawalAmount: 500000,
          duration: 730,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
      ];
      setUserKycLevels(mockUserKycLevels);
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
      const currentUserId = user?.id || "current-user-id";
      
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
      
      // Always filter by current user
      filters.push({
        field: 'userId',
        operator: FilterOperator.EQUALS,
        value: currentUserId
      });
      
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

      // Try to fetch real data first
      try {
        const response: PaginatedResponse<UserKYCLevel> = await userKycLevelsApi.listEnhanced(paginationParams);
        
        setUserKycLevels(response.items);
        setTotalPages(response.total_pages);
        setTotalCount(response.total_count);
        setHasNext(response.has_next);
        setHasPrevious(response.has_previous);
        return;
      } catch (apiError) {
        console.log("API not available, using mock data with pagination:", apiError);
      }
      
      // Fallback to mock data with client-side pagination
      const mockUserKycLevels: UserKYCLevel[] = [
        {
          id: "user-kyc-level-1",
          userId: currentUserId,
          userKycLevelId: "kyc-level-1",
          code: "BASIC",
          description: "Basic KYC Level - Limited transactions and basic verification",
          status: KYCStatus.Approved,
          maxDepositAmount: 10000,
          maxWithdrawalAmount: 5000,
          duration: 30,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-2",
          userId: currentUserId,
          userKycLevelId: "kyc-level-2",
          code: "ENHANCED",
          description: "Enhanced KYC Level - Higher limits with additional verification",
          status: KYCStatus.InProgress,
          maxDepositAmount: 50000,
          maxWithdrawalAmount: 25000,
          duration: 90,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-3",
          userId: currentUserId,
          userKycLevelId: "kyc-level-3",
          code: "PREMIUM",
          description: "Premium KYC Level - Maximum limits with full verification",
          status: KYCStatus.UnderReview,
          maxDepositAmount: 100000,
          maxWithdrawalAmount: 50000,
          duration: 180,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-4",
          userId: currentUserId,
          userKycLevelId: "kyc-level-4",
          code: "VIP",
          description: "VIP KYC Level - Unlimited transactions with premium support",
          status: KYCStatus.Submitted,
          maxDepositAmount: 500000,
          maxWithdrawalAmount: 250000,
          duration: 365,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-level-5",
          userId: currentUserId,
          userKycLevelId: "kyc-level-5",
          code: "ENTERPRISE",
          description: "Enterprise KYC Level - Corporate accounts with custom limits",
          status: KYCStatus.NotSubmitted,
          maxDepositAmount: 1000000,
          maxWithdrawalAmount: 500000,
          duration: 730,
          timeUnit: TimeUnit.Day,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
        },
      ];

      // Apply client-side filtering and pagination for mock data
      let filteredLevels = mockUserKycLevels;

      // Apply search filter
      if (searchTerm) {
        filteredLevels = filteredLevels.filter(level =>
          level.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          level.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredLevels = filteredLevels.filter(level => level.status === statusFilter);
      }

      // Apply sorting
      filteredLevels.sort((a, b) => {
        let aValue = a[sortField as keyof UserKYCLevel];
        let bValue = b[sortField as keyof UserKYCLevel];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === SortOrder.ASC) {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLevels = filteredLevels.slice(startIndex, endIndex);

      setUserKycLevels(paginatedLevels);
      setTotalPages(Math.ceil(filteredLevels.length / pageSize));
      setTotalCount(filteredLevels.length);
      setHasNext(currentPage < Math.ceil(filteredLevels.length / pageSize));
      setHasPrevious(currentPage > 1);
      
    } catch (error) {
      console.error('Error fetching user KYC levels:', error);
      setUserKycLevels([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder, user?.id]);

  const handleViewDetails = (levelId: string) => {
    navigate(`/user/kyc-levels/${levelId}`);
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

  if (loading) {
    return <LoadingSpinner fullscreen={false} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          My KYC Levels
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          View your assigned KYC levels and their details
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Your KYC Level Assignments</CardTitle>
              <CardDescription>
                These are the KYC levels assigned to your account
              </CardDescription>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your KYC levels..."
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
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="UnderReview">Under Review</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="NotSubmitted">Not Submitted</SelectItem>
                </SelectContent>
              </Select>

              {/* Page Size */}
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
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
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="maxDepositAmount">Max Deposit</SelectItem>
                  <SelectItem value="maxWithdrawalAmount">Max Withdrawal</SelectItem>
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
              Showing {userKycLevels.length} of {totalCount} KYC levels (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : userKycLevels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No KYC levels assigned to your account.</p>
            </div>
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
                        {level.description}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(level.status)}`}
                      >
                        {getKycStatusDisplayText(level.status)}
                      </span>
                    </div>
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
                  </div>
                </div>
              ))}
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