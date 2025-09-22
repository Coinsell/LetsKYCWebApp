import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useKYC } from '../../contexts/KYCContext'
import { CheckCircle, FileText, AlertTriangle } from 'lucide-react'

interface PANVerificationStepProps {
  onNext: () => void
  onBack?: () => void
  buttonText?: string
}

export function PANVerificationStep({ onNext, onBack, buttonText = "Continue" }: PANVerificationStepProps) {
  const { state, dispatch } = useKYC()
  const [loading, setLoading] = useState(false)
  const [panData, setPanData] = useState<any>(null)
  const [nameMatchScore, setNameMatchScore] = useState<number | null>(null)
  const [error, setError] = useState('')

  const verifyPAN = async () => {
    if (!state.userInfo?.pan) {
      setError('PAN number is required for verification')
      return
    }

    setLoading(true)
    setError('')

    try {
      // For demo purposes, simulate PAN verification
      console.log('🔍 Verifying PAN:', state.userInfo.pan)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockData = {
        valid: true,
        nameOnPan: state.userInfo.fullName || 'DEMO USER',
        statusCode: 'E',
        panNumber: state.userInfo.pan
      }
      setPanData(mockData)
      
      const score = calculateNameMatch(state.userInfo.fullName || '', mockData.nameOnPan)
      setNameMatchScore(score)
      
      console.log('✅ PAN verification successful:', { score, nameMatch: mockData.nameOnPan })
      
      dispatch({ 
        type: 'SET_PAN_VERIFIED', 
        payload: { verified: true, nameMatch: score }
      })
    } catch (error) {
      console.error('❌ PAN verification failed:', error)
      setError('PAN verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateNameMatch = (name1: string, name2: string): number => {
    // Simple fuzzy matching simulation
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '')
    const n1 = normalize(name1)
    const n2 = normalize(name2)
    
    if (n1 === n2) return 100
    if (n1.includes(n2) || n2.includes(n1)) return 85
    
    // Simple character overlap calculation
    const overlap = [...n1].filter(char => n2.includes(char)).length
    return Math.round((overlap / Math.max(n1.length, n2.length)) * 100)
  }

  const getMatchStatus = (score: number) => {
    if (score >= 90) return { variant: 'success' as const, text: 'Excellent Match' }
    if (score >= 80) return { variant: 'success' as const, text: 'Good Match' }
    if (score >= 70) return { variant: 'warning' as const, text: 'Partial Match' }
    return { variant: 'destructive' as const, text: 'Poor Match' }
  }

  if (state.panVerified && panData) {
    const matchStatus = getMatchStatus(nameMatchScore || 0)
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <CardTitle className="text-green-700">PAN Verified Successfully</CardTitle>
          </div>
          <CardDescription>
            Your PAN details have been verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">PAN Number:</span>
                <span>{state.userInfo?.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name on PAN:</span>
                <span>{panData.nameOnPan}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name Match:</span>
                <Badge variant={matchStatus.variant}>
                  {matchStatus.text} ({nameMatchScore}%)
                </Badge>
              </div>
            </div>
          </div>

          {nameMatchScore && nameMatchScore < 80 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Name Mismatch Detected</p>
                  <p className="text-sm text-yellow-700">
                    The name on your PAN doesn't closely match the provided name. 
                    This may require manual review.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button onClick={onNext} className={!onBack ? "ml-auto" : ""}>
              {buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-1" />
          <CardTitle>PAN Verification</CardTitle>
        </div>
        <CardDescription>
          We'll verify your PAN details with government records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary-2 p-4 rounded-lg border">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">PAN Number:</span>
              <span className="font-mono">{state.userInfo?.pan}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Name (as provided):</span>
              <span>{state.userInfo?.fullName}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">What we verify:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• PAN number validity</li>
            <li>• Name matching with PAN records</li>
            <li>• PAN status (active/inactive)</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium">
            🧪 Development Mode: PAN verification is simulated for testing
          </p>
        </div>

        <div className="text-center">
          <Button onClick={verifyPAN} disabled={loading} size="lg">
            {loading ? 'Verifying PAN...' : 'Verify PAN'}
          </Button>
        </div>

        <div className="flex justify-between">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}