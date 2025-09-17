import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useKYCAdmin, User, KYCStatus, PaginatedResponse, PaginationParams, FilterCondition, FilterOperator, SortCondition, SortOrder } from '../../contexts/KYCAdminContext'
import { Plus, Eye, Pencil, Trash2, FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { userApi } from '../../lib/userapi'
import { userKycLevelsApi } from '../../lib/userkyclevelsapi'
import { getKycStatusDisplayText, getKycStatusColor } from '../../utils/kycStatusConverter'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import { useNavigate } from 'react-router-dom'

export function UsersPage() {
  const { state, dispatch } = useKYCAdmin()
  const navigate = useNavigate()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC)
  
  // Loading state
  const [loading, setLoading] = useState(false)
  
  // Users data
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
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
            field: 'kycStatus',
            operator: FilterOperator.EQUALS,
            value: statusFilter
          }
        ]
      }

      const response: PaginatedResponse<User> = await userApi.listEnhanced(paginationParams)
      
      setUsers(response.items)
      setTotalPages(response.total_pages)
      setTotalCount(response.total_count)
      setHasNext(response.has_next)
      setHasPrevious(response.has_previous)
      
    } catch (error) {
      console.error('Error fetching users:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder, dispatch])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id)
        // Refresh the current page after deletion
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete user' })
      }
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC)
    } else {
      // Set new field with default sort order
      setSortField(field)
      setSortOrder(SortOrder.DESC)
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handleManageKYC = async (userId: string) => {
    // Navigate directly to AdminUserKYCLevelDetailsPage for this specific user
    // This will show the user's KYC progress and allow editing
    try {
      const userKycLevels = await userKycLevelsApi.listByUserId(userId);
      if (userKycLevels && userKycLevels.length > 0) {
        // Navigate to the first KYC level's details page for admin view
        navigate(`/admin/user-kyc-levels/${userKycLevels[0].id}`);
      } else {
        // If no KYC levels found, show a message
        alert('No KYC levels found for this user. Please assign a KYC level first.');
        navigate(`/admin/user-kyc-levels?userId=${userId}`);
      }
    } catch (error) {
      console.error('Error fetching user KYC levels:', error);
      // Fallback to the list view
      navigate(`/admin/user-kyc-levels?userId=${userId}`);
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Users</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage user accounts and KYC status
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and their KYC journey</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.values(KYCStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>
              </div>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-full sm:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {/* Results summary */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-600 dark:text-gray-400 mb-4 gap-3">
                <span>
                  Showing {users.length} of {totalCount} users
                  {searchTerm && ` for "${searchTerm}"`}
                  {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Sort by:</span>
                  <Select value={sortField} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="firstName">First Name</SelectItem>
                      <SelectItem value="lastName">Last Name</SelectItem>
                      <SelectItem value="login">Email</SelectItem>
                      <SelectItem value="kycStatus">KYC Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSortChange(sortField)}
                    className="px-2 flex items-center justify-center"
                  >
                    {sortOrder === SortOrder.ASC ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
              
              {users.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start sm:self-auto ${getKycStatusColor(user.kycStatus)}`}
                    >
                      {getKycStatusDisplayText(user.kycStatus)}
                    </span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-2 text-sm sm:text-base break-all">{user.login}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-sm text-neutral-500">
                    <span className="truncate">DOB: {formatDate(user.dateOfBirth)}</span>
                    <span className="truncate">Country: {user.country}</span>
                    <span className="truncate">Joined: {formatDate(user.createdAt)}</span>
                  </div>
                  {user.contacts.phoneNumbers.length > 0 && (
                    <div className="text-sm text-neutral-500 mt-1 truncate">
                      Phone: {user.contacts.phoneNumbers[0].countryCode} {user.contacts.phoneNumbers[0].phone}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageKYC(user.id)}
                    title="Manage KYC Levels & Details"
                    className="flex items-center gap-2 min-w-0"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">KYC</span>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex items-center gap-2 min-w-0">
                    <Link to={`/admin/users/${user.id}`}>
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </Button>                  
                  {(user.kycStatus === KYCStatus.Submitted || user.kycStatus === KYCStatus.UnderReview) && (
                    <Button variant="outline" size="sm" asChild title="KYC Review" className="flex items-center gap-2 min-w-0">
                      <Link to={`/admin/users/${user.id}/kyc-review`}>
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Review</span>
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex items-center gap-2 min-w-0">
                    <Pencil className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)} className="flex items-center gap-2 min-w-0">
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-500 dark:text-neutral-400">No users found</p>
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700 gap-4">
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
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                      className="flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Next</span>
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
                  
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}