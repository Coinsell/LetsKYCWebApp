import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { useKYC } from '../../contexts/KYCContext'
import { CheckCircle, Smartphone } from 'lucide-react'

interface MobileOTPStepProps {
  onNext: () => void
  onBack?: () => void
  buttonText?: string
}

export function MobileOTPStep({ onNext, onBack, buttonText = "Continue" }: MobileOTPStepProps) {
  const { state, dispatch } = useKYC()
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const maskedMobile = state.userInfo?.mobile 
    ? `+91-XXXXXX${state.userInfo.mobile.slice(-4)}`
    : ''

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: state.userInfo?.mobile,
          kycId: state.kycId
        })
      })
      
      if (response.ok) {
        setOtpSent(true)
        setCountdown(60)
      } else {
        setError('Failed to send OTP. Please try again.')
      }
    } catch (error) {
      // For demo purposes, simulate success
      setOtpSent(true)
      setCountdown(60)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId: state.kycId,
          code: otp
        })
      })
      
      if (response.ok) {
        dispatch({ type: 'SET_MOBILE_VERIFIED', payload: true })
        onNext()
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (error) {
      // For demo purposes, simulate success if OTP is "123456"
      if (otp === '123456') {
        dispatch({ type: 'SET_MOBILE_VERIFIED', payload: true })
        onNext()
      } else {
        setError('Invalid OTP. Please try again. (Use 123456 for demo)')
      }
    } finally {
      setLoading(false)
    }
  }

  if (state.mobileVerified) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <CardTitle className="text-green-700">Mobile Verified Successfully</CardTitle>
          </div>
          <CardDescription>
            Your mobile number has been verified
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          <Smartphone className="w-6 h-6 text-primary-1" />
          <CardTitle>Mobile Verification</CardTitle>
        </div>
        <CardDescription>
          We'll send an OTP to verify your mobile number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-secondary-2 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-800">Mobile Number</p>
              <p className="text-neutral-600">{maskedMobile}</p>
            </div>
            <Badge variant="outline">Unverified</Badge>
          </div>
        </div>

        {!otpSent ? (
          <div className="text-center">
            <Button onClick={sendOTP} disabled={loading} size="lg">
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Enter 6-digit OTP
              </label>
              <Input
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-xs text-neutral-500 mt-1">
                For demo purposes, use OTP: 123456
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Didn\'t receive OTP?'}
              </span>
              {countdown === 0 && (
                <Button variant="link" onClick={sendOTP} disabled={loading}>
                  Resend OTP
                </Button>
              )}
            </div>

            <Button 
              onClick={verifyOTP} 
              disabled={loading || otp.length !== 6}
              className="w-full"
              size="lg"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button variant="link" onClick={onBack || (() => {})}>
            Change Mobile Number
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}