import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { useKYCAdmin, User, KYCStatus } from '../../contexts/KYCAdminContext'
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, Eye } from 'lucide-react'

export function UserKYCReviewPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useKYCAdmin()
  const [user, setUser] = useState<User | null>(null)
  const [kycSubmission, setKycSubmission] = useState<any>(null)
  const [reviewComments, setReviewComments] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchKYCSubmission(userId)
    }
  }, [userId])

  const fetchKYCSubmission = async (id: string) => {
    try {
      const foundUser = state.users.find(u => u.id === id)
      if (foundUser) {
        setUser(foundUser)
        
        // Mock KYC submission data
        const mockSubmission = {
          id: 'kyc-sub-1',
          userId: id,
          submittedAt: '2024-01-15T15:30:00Z',
          documents: [
            {
              id: 'doc-1',
              type: 'identity_proof',
              name: 'passport.pdf',
              url: '/documents/passport.pdf',
              uploadedAt: '2024-01-15T14:00:00Z',
              status: 'submitted'
            },
            {
              id: 'doc-2',
              type: 'address_proof',
              name: 'utility_bill.pdf',
              url: '/documents/utility_bill.pdf',
              uploadedAt: '2024-01-15T14:15:00Z',
              status: 'submitted'
            },
            {
              id: 'doc-3',
              type: 'selfie',
              name: 'selfie.jpg',
              url: '/documents/selfie.jpg',
              uploadedAt: '2024-01-15T14:30:00Z',
              status: 'submitted'
            }
          ],
          personalInfo: {
            fullName: foundUser.firstName + ' ' + foundUser.lastName,
            dateOfBirth: foundUser.dateOfBirth,
            nationality: foundUser.country,
            occupation: 'Software Engineer',
            income: '$75,000 - $100,000'
          },
          verificationResults: {
            panVerification: { status: 'verified', score: 95 },
            aadhaarVerification: { status: 'verified', score: 92 },
            faceMatch: { status: 'verified', score: 88 },
            addressMatch: { status: 'verified', score: 90 }
          },
          riskScore: 85,
          complianceFlags: []
        }
        setKycSubmission(mockSubmission)
      }
    } catch (error) {
      console.error('Failed to fetch KYC submission:', error)
    }
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      // Mock API call to approve KYC
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user status
      if (user) {
        const updatedUser = { ...user, kycStatus: KYCStatus.Approved }
        dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      }
      
      navigate('/admin/users')
    } catch (error) {
      console.error('Failed to approve KYC:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!reviewComments.trim()) {
      alert('Please provide rejection comments')
      return
    }
    
    setIsProcessing(true)
    try {
      // Mock API call to reject KYC
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user status
      if (user) {
        const updatedUser = { ...user, kycStatus: KYCStatus.Rejected, remarks: reviewComments }
        dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      }
      
      navigate('/admin/users')
    } catch (error) {
      console.error('Failed to reject KYC:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getVerificationBadge = (status: string, score?: number) => {
    if (status === 'verified') {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified {score && `(${score}%)`}
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    )
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!user || !kycSubmission) {
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
            <p className="text-center text-neutral-500">KYC submission not found</p>
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
              KYC Review: {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Submitted on {new Date(kycSubmission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge variant="warning">Pending Review</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents & Verification */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>Review uploaded documents and verification results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Documents */}
            <div>
              <h3 className="font-semibold mb-4">Documents</h3>
              <div className="space-y-3">
                {kycSubmission.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-neutral-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-neutral-500 capitalize">
                          {doc.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Submitted</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Results */}
            <div>
              <h3 className="font-semibold mb-4">Verification Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">PAN Verification</span>
                    {getVerificationBadge(
                      kycSubmission.verificationResults.panVerification.status,
                      kycSubmission.verificationResults.panVerification.score
                    )}
                  </div>
                </div>

                <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Aadhaar Verification</span>
                    {getVerificationBadge(
                      kycSubmission.verificationResults.aadhaarVerification.status,
                      kycSubmission.verificationResults.aadhaarVerification.score
                    )}
                  </div>
                </div>

                <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Face Match</span>
                    {getVerificationBadge(
                      kycSubmission.verificationResults.faceMatch.status,
                      kycSubmission.verificationResults.faceMatch.score
                    )}
                  </div>
                </div>

                <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Address Match</span>
                    {getVerificationBadge(
                      kycSubmission.verificationResults.addressMatch.status,
                      kycSubmission.verificationResults.addressMatch.score
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Full Name:</span>
                  <p className="text-neutral-600 dark:text-neutral-400">{kycSubmission.personalInfo.fullName}</p>
                </div>
                <div>
                  <span className="font-medium">Date of Birth:</span>
                  <p className="text-neutral-600 dark:text-neutral-400">{kycSubmission.personalInfo.dateOfBirth}</p>
                </div>
                <div>
                  <span className="font-medium">Nationality:</span>
                  <p className="text-neutral-600 dark:text-neutral-400">{kycSubmission.personalInfo.nationality}</p>
                </div>
                <div>
                  <span className="font-medium">Occupation:</span>
                  <p className="text-neutral-600 dark:text-neutral-400">{kycSubmission.personalInfo.occupation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>Approve or reject this KYC submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Score */}
            <div className="text-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-sm font-medium mb-2">Risk Score</p>
              <p className={`text-3xl font-bold ${getRiskScoreColor(kycSubmission.riskScore)}`}>
                {kycSubmission.riskScore}%
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {kycSubmission.riskScore >= 80 ? 'Low Risk' : 
                 kycSubmission.riskScore >= 60 ? 'Medium Risk' : 'High Risk'}
              </p>
            </div>

            {/* Compliance Flags */}
            {kycSubmission.complianceFlags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Compliance Flags</h4>
                <div className="space-y-2">
                  {kycSubmission.complianceFlags.map((flag: string, index: number) => (
                    <Badge key={index} variant="destructive" className="block text-center">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Review Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Review Comments</Label>
              <Textarea
                id="comments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Add your review comments here..."
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Approve KYC'}
              </Button>
              
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <XCircle className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Reject KYC'}
              </Button>
            </div>

            <div className="text-xs text-neutral-500 text-center">
              This action will update the user's KYC status and send them a notification.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}