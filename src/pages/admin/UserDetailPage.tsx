import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { useKYCAdmin, User, KYCStatus } from '../../contexts/KYCAdminContext'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Globe, FileText, CheckCircle, Clock, XCircle } from 'lucide-react'
import { getKycStatusDisplayText } from '../../utils/kycStatusConverter'

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { state } = useKYCAdmin()
  const [user, setUser] = useState<User | null>(null)
  const [kycProgress, setKycProgress] = useState<any[]>([])

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId)
    }
  }, [userId])

  const fetchUserDetails = async (id: string) => {
    try {
      // Find user from state or fetch from API
      const foundUser = state.users.find(u => u.id === id)
      if (foundUser) {
        setUser(foundUser)
        
        // Mock KYC progress data
        const mockProgress = [
          { step: 'Personal Information', status: 'completed', completedAt: '2024-01-15T10:00:00Z' },
          { step: 'Phone Verification', status: 'completed', completedAt: '2024-01-15T10:30:00Z' },
          { step: 'Address Information', status: 'completed', completedAt: '2024-01-15T11:00:00Z' },
          { step: 'Identity Proof Upload', status: 'pending', completedAt: null },
          { step: 'Address Proof Upload', status: 'pending', completedAt: null },
        ]
        setKycProgress(mockProgress)
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-neutral-400" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-neutral-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'in-progress':
        return <Badge variant="default">In Progress</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-neutral-500">User not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              User Details & KYC Status
            </p>
          </div>
        </div>
        {user.kycStatus === KYCStatus.Submitted && (
          <Button asChild>
            <Link to={`/admin/users/${user.id}/kyc-review`}>
              <FileText className="h-4 w-4 mr-2" />
              Review KYC
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>User account details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.login}`} />
                <AvatarFallback className="text-lg">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{user.login}</p>
                <Badge 
                  variant={
                    user.kycStatus === KYCStatus.Approved ? 'success' :
                    user.kycStatus === KYCStatus.Rejected ? 'destructive' :
                    user.kycStatus === KYCStatus.UnderReview ? 'warning' :
                    user.kycStatus === KYCStatus.Submitted ? 'warning' :
                    user.kycStatus === KYCStatus.InProgress ? 'default' :
                    'secondary'
                  }
                  className="mt-2"
                >
                  {getKycStatusDisplayText(user.kycStatus)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.login}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-medium">Date of Birth</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(user.dateOfBirth)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-medium">Country</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {user.contacts.phoneNumbers.length > 0 && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user.contacts.phoneNumbers[0].countryCode} {user.contacts.phoneNumbers[0].phone}
                      </p>
                    </div>
                  </div>
                )}

                {user.contacts.addresses.length > 0 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        <p>{user.contacts.addresses[0].line1}</p>
                        {user.contacts.addresses[0].line2 && <p>{user.contacts.addresses[0].line2}</p>}
                        <p>
                          {user.contacts.addresses[0].city}, {user.contacts.addresses[0].state} {user.contacts.addresses[0].postalCode}
                        </p>
                        <p>{user.contacts.addresses[0].country}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="font-medium">Joined</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Progress</CardTitle>
            <CardDescription>Verification steps completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kycProgress.map((step, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <p className="font-medium text-sm">{step.step}</p>
                      {step.completedAt && (
                        <p className="text-xs text-neutral-500">
                          {formatDate(step.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(step.status)}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Overall Progress
                </p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-primary-1 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(kycProgress.filter(s => s.status === 'completed').length / kycProgress.length) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {kycProgress.filter(s => s.status === 'completed').length} of {kycProgress.length} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}