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
  UserKYCDetail,
  User,
  KYCStatus,
  KycDetailType,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, Eye, Search, Paperclip, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userKycDetailsApi } from "../../lib/userkycdetailsapi";
import { userApi } from "../../lib/userapi";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../../utils/kycStatusConverter";

export function AdminUserKYCDetailsPage() {
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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [userKycDetails, setUserKycDetails] = useState<UserKYCDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   fetchData();
  // }, []);

  useEffect(() => {
    loadDetailsWithPagination();
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, userFilter, sortField, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const usersData = await userApi.list();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
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
      
      // User filter
      if (userFilter !== 'all') {
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

      const response: PaginatedResponse<UserKYCDetail> = await userKycDetailsApi.listEnhanced(paginationParams);
      
      setUserKycDetails(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching user KYC details:', error);
      setUserKycDetails([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, userFilter, sortField, sortOrder]);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.login || "Unknown Email";
  };

  const getKycDetailTypeLabel = (type: KycDetailType) => {
    const typeLabels: Record<KycDetailType, string> = {
      [KycDetailType.general]: "General",
      [KycDetailType.phoneNo]: "Phone Number",
      [KycDetailType.address]: "Address",
      [KycDetailType.addressProof]: "Address Proof",
      [KycDetailType.selfie]: "Selfie",
      [KycDetailType.identityProof]: "Identity Proof",
      [KycDetailType.occupation]: "Occupation",
      [KycDetailType.pepDeclaration]: "PEP Declaration",
      [KycDetailType.userInfo]: "User Info",
      [KycDetailType.aadhaar]: "Aadhaar",
      [KycDetailType.pan]: "PAN",
      [KycDetailType.liveliness]: "Liveliness Check",
    };
    return typeLabels[type] || type;
  };

  const handleCreate = () => {
    navigate("/admin/user-kyc-details/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/user-kyc-details/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/admin/user-kyc-details/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user KYC detail?")) {
      try {
        await userKycDetailsApi.delete(id);
        loadDetailsWithPagination(); // Refresh paginated data
      } catch (error) {
        console.error("Error deleting user KYC detail:", error);
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

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
              User KYC Details
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Monitor and manage individual user KYC progress and details
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add KYC Detail
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User KYC Progress Details</CardTitle>
                <CardDescription>
                  View and manage KYC progress details for all users
                </CardDescription>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search user KYC details..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User Filter */}
              <Select value={userFilter} onValueChange={handleUserFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
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
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="UnderReview">Under Review</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="NotSubmitted">Not Submitted</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="userInfo">User Info</SelectItem>
                  <SelectItem value="phoneNo">Phone Number</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="addressProof">Address Proof</SelectItem>
                  <SelectItem value="identityProof">Identity Proof</SelectItem>
                  <SelectItem value="selfie">Selfie</SelectItem>
                  <SelectItem value="occupation">Occupation</SelectItem>
                  <SelectItem value="pepDeclaration">PEP Declaration</SelectItem>
                  <SelectItem value="aadhaar">Aadhaar</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                  <SelectItem value="liveliness">Liveliness Check</SelectItem>
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
                  <SelectItem value="step">Step</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
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
              Showing {userKycDetails.length} of {totalCount} user KYC details (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : userKycDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No user KYC details found.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {userKycDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Step {detail.sequence}
                      </Badge>
                      <h3 className="font-semibold text-lg">{detail.step}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getKycDetailTypeLabel(detail.type)}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(detail.status)}`}
                      >
                        {getKycStatusDisplayText(detail.status)}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      <strong>User:</strong> {getUserName(detail.userId)} ({getUserEmail(detail.userId)})
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      {detail.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Type:</strong> {getKycDetailTypeLabel(detail.type)}
                      </span>
                      {detail.hasAttachments && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-4 w-4 text-blue-600" />
                          {detail.attachments.length} attachment(s)
                        </span>
                      )}
                      <span>
                        <strong>Last Updated:</strong> {new Date(detail.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(detail.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(detail.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(detail.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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
