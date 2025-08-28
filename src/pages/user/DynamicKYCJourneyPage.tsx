import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { useKYCAdmin, KYCDetail, KYCStatus } from '../../contexts/KYCAdminContext'
import { Progress } from '../../components/ui/progress'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function DynamicKYCJourneyPage() {
  const { user } = useAuth()
  const { state } = useKYCAdmin()
  const [userKycLevel, setUserKycLevel] = useState<any>(null)
  const [kycSteps, setKycSteps] = useState<KYCDetail[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    // Fetch user's assigned KYC level and steps
    fetchUserKYCData()
  }, [user])

  const fetchUserKYCData = async () => {
    try {
      // Mock: Get user's assigned KYC level
      const mockUserKycLevel = {
        id: '1',
        userId: user?.id,
        kycLevelId: 'kyc-level-1',
        code: 'BASIC',
        description: 'Basic KYC Level',
        status: KYCStatus.InProgress
      }

      // Mock: Get KYC steps for this level
      const mockKycSteps: KYCDetail[] = [
        {
          id: '1',
          kycLevelId: 'kyc-level-1',
          sequence: 1,
          step: 'Personal Information',
          description: 'Provide your basic personal details',
          type: 'general' as any,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false
        },
        {
          id: '2',
          kycLevelId: 'kyc-level-1',
          sequence: 2,
          step: 'Phone Verification',
          description: 'Verify your phone number with OTP',
          type: 'phoneNo' as any,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false
        },
        {
          id: '3',
          kycLevelId: 'kyc-level-1',
          sequence: 3,
          step: 'Address Information',
          description: 'Provide your current address details',
          type: 'address' as any,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false
        },
        {
          id: '4',
          kycLevelId: 'kyc-level-1',
          sequence: 4,
          step: 'Identity Proof',
          description: 'Upload government issued identity proof',
          type: 'identityProof' as any,
          status: KYCStatus.NotSubmitted,
          hasAttachments: true
        }
      ]

      setUserKycLevel(mockUserKycLevel)
      setKycSteps(mockKycSteps.sort((a, b) => a.sequence - b.sequence))
    } catch (error) {
      console.error('Failed to fetch KYC data:', error)
    }
  }

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId])
    // Move to next step
    const nextStepIndex = kycSteps.findIndex(step => step.id === stepId) + 1
    if (nextStepIndex < kycSteps.length) {
      setCurrentStep(nextStepIndex)
    }
  }

  const getStepStatus = (step: KYCDetail) => {
    if (completedSteps.includes(step.id)) {
      return 'completed'
    }
    if (kycSteps.findIndex(s => s.id === step.id) === currentStep) {
      return 'current'
    }
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'current':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-neutral-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'current':
        return <Badge variant="default">In Progress</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const progressPercentage = (completedSteps.length / kycSteps.length) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Your KYC Journey
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Complete your KYC verification process step by step
        </p>
      </div>

      {userKycLevel && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Level: {userKycLevel.code}</CardTitle>
                <CardDescription>{userKycLevel.description}</CardDescription>
              </div>
              <Badge 
                variant={
                  userKycLevel.status === KYCStatus.Approved ? 'success' :
                  userKycLevel.status === KYCStatus.InProgress ? 'default' :
                  'secondary'
                }
              >
                {userKycLevel.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-neutral-600">
                    {completedSteps.length} of {kycSteps.length} completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="space-y-3">
                {kycSteps.map((step, index) => {
                  const status = getStepStatus(step)
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        status === 'current' 
                          ? 'border-primary-1 bg-primary-1/5' 
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status)}
                        <div>
                          <h3 className="font-medium">{step.step}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {step.description}
                          </p>
                          {step.hasAttachments && (
                            <p className="text-xs text-neutral-500 mt-1">
                              📎 Attachments required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status)}
                        {status === 'current' && (
                          <Button
                            size="sm"
                            onClick={() => handleStepComplete(step.id)}
                          >
                            Complete Step
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {completedSteps.length === kycSteps.length && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    KYC Journey Complete!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                    Your KYC verification is now under review. You'll be notified once approved.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}