import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useKYC } from '../../contexts/KYCContext'
import { CheckCircle, AlertTriangle, Clock, XCircle, FileText, Shield, Smartphone, Camera, UserCheck } from 'lucide-react'

interface ReviewStepProps {
  onBack: () => void
}

export function ReviewStep({ onBack }: ReviewStepProps) {
  const { state, dispatch } = useKYC()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showDataModal, setShowDataModal] = useState(false)

  const calculateRiskScore = () => {
    let score = 0
    let maxScore = 0

    // Mobile verification (20 points)
    maxScore += 20
    if (state.mobileVerified) score += 20

    // PAN verification (30 points)
    maxScore += 30
    if (state.panVerified) {
      score += 20
      if (state.panNameMatch && state.panNameMatch >= 80) score += 10
    }

    // Aadhaar verification (40 points)
    maxScore += 40
    if (state.aadhaarVerified) score += 40

    // Liveness verification (10 points)
    maxScore += 10
    if (state.livenessVerified && state.faceMatchScore && state.faceMatchScore >= 80) {
      score += 10
    }

    return Math.round((score / maxScore) * 100)
  }

  const getFinalStatus = () => {
    const riskScore = calculateRiskScore()
    
    if (riskScore >= 90) return 'Verified'
    if (riskScore >= 70) return 'PendingReview'
    return 'Rejected'
  }

  const submitKYC = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId: state.kycId })
      })

      if (response.ok) {
        const finalStatus = getFinalStatus()
        dispatch({ type: 'SET_FINAL_STATUS', payload: finalStatus as any })
        setSubmitted(true)
      }
    } catch (error) {
      // For demo purposes, simulate success
      const finalStatus = getFinalStatus()
      dispatch({ type: 'SET_FINAL_STATUS', payload: finalStatus as any })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (verified: boolean, optional = false) => {
    if (verified) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (optional) return <Clock className="w-5 h-5 text-yellow-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (verified: boolean, score?: number | null, optional = false) => {
    if (verified) {
      if (score !== null && score !== undefined) {
        if (score >= 90) return <Badge variant="success">Excellent ({score}%)</Badge>
        if (score >= 80) return <Badge variant="success">Good ({score}%)</Badge>
        if (score >= 70) return <Badge variant="warning">Fair ({score}%)</Badge>
        return <Badge variant="destructive">Poor ({score}%)</Badge>
      }
      return <Badge variant="success">Verified</Badge>
    }
    if (optional) return <Badge variant="pending">Skipped</Badge>
    return <Badge variant="destructive">Failed</Badge>
  }

  const riskScore = calculateRiskScore()
  const finalStatus = getFinalStatus()

  if (submitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {finalStatus === 'Verified' && <CheckCircle className="w-16 h-16 text-green-500" />}
            {finalStatus === 'PendingReview' && <Clock className="w-16 h-16 text-yellow-500" />}
            {finalStatus === 'Rejected' && <XCircle className="w-16 h-16 text-red-500" />}
          </div>
          <CardTitle className={`text-2xl ${
            finalStatus === 'Verified' ? 'text-green-700' : 
            finalStatus === 'PendingReview' ? 'text-yellow-700' : 'text-red-700'
          }`}>
            {finalStatus === 'Verified' && 'KYC Verification Complete!'}
            {finalStatus === 'PendingReview' && 'KYC Under Review'}
            {finalStatus === 'Rejected' && 'KYC Verification Failed'}
          </CardTitle>
          <CardDescription className="text-lg">
            {finalStatus === 'Verified' && 'Your identity has been successfully verified'}
            {finalStatus === 'PendingReview' && 'Your application is being reviewed by our compliance team'}
            {finalStatus === 'Rejected' && 'Please contact support for assistance'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${
            finalStatus === 'Verified' ? 'bg-green-50 border-green-200' :
            finalStatus === 'PendingReview' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="text-center">
              <p className="font-medium mb-2">Risk Score: {riskScore}%</p>
              <p className="text-sm">
                {finalStatus === 'Verified' && 'All verification checks passed successfully.'}
                {finalStatus === 'PendingReview' && 'Some verification checks require manual review.'}
                {finalStatus === 'Rejected' && 'Verification requirements not met.'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-600">
              KYC ID: {state.kycId || 'KYC-DEMO-' + Date.now()}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Please review your verification details before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Verification Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(state.mobileVerified)}
                <Smartphone className="w-5 h-5 text-neutral-600" />
                <span>Mobile Verification</span>
              </div>
              {getStatusBadge(state.mobileVerified)}
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(state.panVerified)}
                <FileText className="w-5 h-5 text-neutral-600" />
                <span>PAN Verification</span>
              </div>
              {getStatusBadge(state.panVerified, state.panNameMatch)}
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(state.aadhaarVerified)}
                <Shield className="w-5 h-5 text-neutral-600" />
                <span>Aadhaar e-KYC</span>
              </div>
              {getStatusBadge(state.aadhaarVerified)}
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(state.livenessVerified, true)}
                <Camera className="w-5 h-5 text-neutral-600" />
                <span>Liveness Check (Optional)</span>
              </div>
              {getStatusBadge(state.livenessVerified, state.faceMatchScore, true)}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Overall Risk Score:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-neutral-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    riskScore >= 90 ? 'bg-green-500' :
                    riskScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
              <span className="font-bold">{riskScore}%</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            riskScore >= 90 ? 'bg-green-50 border-green-200' :
            riskScore >= 70 ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {riskScore >= 90 ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> :
               riskScore >= 70 ? <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" /> :
               <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              <div>
                <p className="font-medium">
                  {riskScore >= 90 ? 'Ready for Approval' :
                   riskScore >= 70 ? 'Requires Manual Review' :
                   'Verification Incomplete'}
                </p>
                <p className="text-sm mt-1">
                  {riskScore >= 90 ? 'All verification checks passed successfully.' :
                   riskScore >= 70 ? 'Some verification checks may require manual review by our compliance team.' :
                   'Please complete the required verification steps.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-neutral-700">
              I agree to the{' '}
              <button 
                type="button"
                className="text-primary-1 underline"
                onClick={() => setShowDataModal(true)}
              >
                Terms & Conditions
              </button>{' '}
              and consent to the processing of my personal data for KYC verification purposes.
            </label>
          </div>

          <Button
            onClick={submitKYC}
            disabled={loading || !agreedToTerms}
            className="w-full"
            size="lg"
          >
            {loading ? 'Submitting...' : 'Submit KYC Application'}
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setShowDataModal(true)}
            className="text-sm"
          >
            What data do we store?
          </Button>
        </div>

        {showDataModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-4">Data Storage & Privacy</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium">What we store:</h4>
                    <ul className="list-disc list-inside text-neutral-600 mt-1 space-y-1">
                      <li>Personal information (name, DOB, address)</li>
                      <li>PAN verification results</li>
                      <li>Aadhaar e-KYC data (encrypted)</li>
                      <li>Verification timestamps and audit logs</li>
                      <li>Risk assessment scores</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Security measures:</h4>
                    <ul className="list-disc list-inside text-neutral-600 mt-1 space-y-1">
                      <li>End-to-end encryption</li>
                      <li>Secure cloud storage (Azure/AWS)</li>
                      <li>Access controls and audit trails</li>
                      <li>Compliance with FIU/PMLA regulations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium">Data retention:</h4>
                    <p className="text-neutral-600">
                      Data is retained as per regulatory requirements (typically 5-8 years) 
                      and then securely deleted.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setShowDataModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}