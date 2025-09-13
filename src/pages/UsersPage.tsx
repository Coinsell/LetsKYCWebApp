import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useKYCAdmin, User, KYCStatus } from '../contexts/KYCAdminContext'
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react'
import { userApi } from '../lib/userapi'
import { userKycLevelsApi } from '../lib/userkyclevelsapi'
import { getKycStatusDisplayText, getKycStatusColor } from '../utils/kycStatusConverter'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { useNavigate } from 'react-router-dom'

export function UsersPage() {
  const { state, dispatch } = useKYCAdmin()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const users = await userApi.list()
      dispatch({ type: 'SET_USERS', payload: users })
    } catch (error) {
      console.error('Error fetching users:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id)
        dispatch({ type: 'DELETE_USER', payload: id })
      } catch (error) {
        console.error('Error deleting user:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete user' })
      }
    }
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

  const filteredUsers = state.users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.login.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.kycStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
          <p className="mt-2 text-sm text-neutral-600">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage user accounts and their KYC journey</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(user.kycStatus)}`}
                    >
                      {getKycStatusDisplayText(user.kycStatus)}
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-2">{user.login}</p>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span>DOB: {formatDate(user.dateOfBirth)}</span>
                    <span>Country: {user.country}</span>
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>
                  {user.contacts.phoneNumbers.length > 0 && (
                    <div className="text-sm text-neutral-500 mt-1">
                      Phone: {user.contacts.phoneNumbers[0].countryCode} {user.contacts.phoneNumbers[0].phone}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageKYC(user.id)}
                    title="Manage KYC Levels & Details"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No users found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}