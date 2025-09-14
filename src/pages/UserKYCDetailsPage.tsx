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
  UserKYCDetail,
  KYCStatus,
  KycDetailType,
  PaginatedResponse,
  PaginationParams,
  FilterCondition,
  FilterOperator,
  SortCondition,
  SortOrder,
} from "../contexts/KYCAdminContext";
import { userKycDetailsApi } from "../lib/userkycdetailsapi";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../utils/kycStatusConverter";
import { Paperclip, CheckCircle, Clock, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function UserKYCDetailsPage() {
  const { user } = useAuth();
  
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
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [userKycDetails, setUserKycDetails] = useState<UserKYCDetail[]>([]);

  useEffect(() => {
    fetchUserKycDetails();
  }, []);

  useEffect(() => {
    loadDetailsWithPagination();
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, sortField, sortOrder, user?.id]);

  const fetchUserKycDetails = async () => {
    // This function is kept for backward compatibility but not used in pagination
    console.log("fetchUserKycDetails called - using loadDetailsWithPagination instead");
  };

  const loadDetailsWithPagination = useCallback(async () => {
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

      // Try to fetch real data first
      try {
        const response: PaginatedResponse<UserKYCDetail> = await userKycDetailsApi.listEnhanced(paginationParams);
        
        setUserKycDetails(response.items);
        setTotalPages(response.total_pages);
        setTotalCount(response.total_count);
        setHasNext(response.has_next);
        setHasPrevious(response.has_previous);
        return;
      } catch (apiError) {
        console.log("API not available, using mock data with pagination:", apiError);
      }
      
      // Fallback to mock data with client-side pagination
      const mockUserKycDetails: UserKYCDetail[] = [
        {
          id: "user-kyc-detail-1",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-1",
          userKycLevelId: "kyc-level-1",
          sequence: 1,
          step: "Personal Information",
          description: "Provide your personal information including name, date of birth, and contact details",
          type: KycDetailType.userInfo,
          status: KYCStatus.Approved,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-2",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-2",
          userKycLevelId: "kyc-level-1",
          sequence: 2,
          step: "Phone Verification",
          description: "Verify your phone number with OTP",
          type: KycDetailType.phoneNo,
          status: KYCStatus.InProgress,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-3",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-3",
          userKycLevelId: "kyc-level-1",
          sequence: 3,
          step: "Identity Document",
          description: "Upload a valid government-issued ID document",
          type: KycDetailType.identityProof,
          status: KYCStatus.UnderReview,
          hasAttachments: true,
          attachments: [
            {
              id: "attachment-1",
              filename: "passport.pdf",
              type: "application/pdf",
              url: "https://example.com/passport.pdf"
            }
          ],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-4",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-4",
          userKycLevelId: "kyc-level-1",
          sequence: 4,
          step: "Address Proof",
          description: "Upload a recent utility bill or bank statement",
          type: KycDetailType.addressProof,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-5",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-5",
          userKycLevelId: "kyc-level-2",
          sequence: 5,
          step: "Selfie Verification",
          description: "Take a selfie for facial recognition verification",
          type: KycDetailType.selfie,
          status: KYCStatus.Submitted,
          hasAttachments: true,
          attachments: [
            {
              id: "attachment-2",
              filename: "selfie.jpg",
              type: "image/jpeg",
              url: "https://example.com/selfie.jpg"
            }
          ],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-6",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-6",
          userKycLevelId: "kyc-level-2",
          sequence: 6,
          step: "Occupation Details",
          description: "Provide your occupation and employment information",
          type: KycDetailType.occupation,
          status: KYCStatus.Approved,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-7",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-7",
          userKycLevelId: "kyc-level-3",
          sequence: 7,
          step: "PEP Declaration",
          description: "Declare if you are a Politically Exposed Person (PEP)",
          type: KycDetailType.pepDeclaration,
          status: KYCStatus.InProgress,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-8",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-8",
          userKycLevelId: "kyc-level-3",
          sequence: 8,
          step: "Aadhaar Verification",
          description: "Verify your Aadhaar number and upload Aadhaar card",
          type: KycDetailType.aadhaar,
          status: KYCStatus.UnderReview,
          hasAttachments: true,
          attachments: [
            {
              id: "attachment-3",
              filename: "aadhaar.pdf",
              type: "application/pdf",
              url: "https://example.com/aadhaar.pdf"
            }
          ],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-9",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-9",
          userKycLevelId: "kyc-level-3",
          sequence: 9,
          step: "PAN Verification",
          description: "Verify your PAN number and upload PAN card",
          type: KycDetailType.pan,
          status: KYCStatus.Rejected,
          hasAttachments: true,
          attachments: [
            {
              id: "attachment-4",
              filename: "pan.pdf",
              type: "application/pdf",
              url: "https://example.com/pan.pdf"
            }
          ],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "user-kyc-detail-10",
          userId: currentUserId,
          userKycDetailId: "kyc-detail-10",
          userKycLevelId: "kyc-level-4",
          sequence: 10,
          step: "Liveliness Check",
          description: "Complete a liveliness check for enhanced security",
          type: KycDetailType.liveliness,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
          attachments: [],
          docType: "UserKycDetail",
          lastUpdated: new Date().toISOString(),
        },
      ];

      // Apply client-side filtering and pagination for mock data
      let filteredDetails = mockUserKycDetails;

      // Apply search filter
      if (searchTerm) {
        filteredDetails = filteredDetails.filter(detail =>
          detail.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
          detail.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredDetails = filteredDetails.filter(detail => detail.status === statusFilter);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filteredDetails = filteredDetails.filter(detail => detail.type === typeFilter);
      }

      // Apply sorting
      filteredDetails.sort((a, b) => {
        let aValue = a[sortField as keyof UserKYCDetail];
        let bValue = b[sortField as keyof UserKYCDetail];
        
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
      const paginatedDetails = filteredDetails.slice(startIndex, endIndex);

      setUserKycDetails(paginatedDetails);
      setTotalPages(Math.ceil(filteredDetails.length / pageSize));
      setTotalCount(filteredDetails.length);
      setHasNext(currentPage < Math.ceil(filteredDetails.length / pageSize));
      setHasPrevious(currentPage > 1);
      
    } catch (error) {
      console.error('Error fetching user KYC details:', error);
      setUserKycDetails([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, sortField, sortOrder, user?.id]);

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

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.Approved:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case KYCStatus.InProgress:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case KYCStatus.UnderReview:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case KYCStatus.Rejected:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
          My KYC Progress
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Track your KYC verification progress and requirements
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Your KYC Verification Steps</CardTitle>
              <CardDescription>
                Complete these steps to verify your identity and complete KYC
              </CardDescription>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search your KYC steps..."
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
              Showing {userKycDetails.length} of {totalCount} KYC steps (Page {currentPage} of {totalPages})
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : userKycDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No KYC details found for your account.</p>
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
                      <div className="flex items-center gap-2">
                        {getStatusIcon(detail.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(detail.status)}`}
                        >
                          {getKycStatusDisplayText(detail.status)}
                        </span>
                      </div>
                    </div>
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