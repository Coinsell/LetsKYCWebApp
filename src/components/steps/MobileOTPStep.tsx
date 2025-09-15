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
  console.log('MobileOTPStep props:', { onNext: !!onNext, onBack: !!onBack, buttonText });
  const { state, dispatch } = useKYC()
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mobileVerified, setMobileVerified] = useState(false)

  // Get mobile number from KYC context or use a default for demo
  const mobileNumber = state.userInfo?.mobile || '+91-9876543210'
  const maskedMobile = mobileNumber 
    ? `+91-XXXXXX${mobileNumber.slice(-4)}`
    : '+91-XXXXXX3210'

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
      // For demo purposes, simulate OTP sending
      console.log('Sending OTP to:', mobileNumber)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOtpSent(true)
      setCountdown(60)
      console.log('OTP sent successfully (demo)')
    } catch (error) {
      console.error('Error sending OTP:', error)
      setError('Failed to send OTP. Please try again.')
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
      // For demo purposes, accept any 6-digit OTP or "123456"
      console.log('Verifying OTP:', otp)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (otp === '123456' || otp.length === 6) {
        setMobileVerified(true)
        dispatch({ type: 'SET_MOBILE_VERIFIED', payload: true })
        console.log('OTP verified successfully (demo)')
        // Don't call onNext() immediately, let user see the success state
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setError('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (mobileVerified || state.mobileVerified) {
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
            <Button onClick={() => {
              console.log('Mobile verification completed, proceeding to next step');
              onNext();
            }} className={!onBack ? "ml-auto" : ""}>
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
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                  setError('')
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-xs text-neutral-500 mt-1">
                For demo purposes, use any 6-digit number (e.g., 123456)
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
          <Button variant="link" onClick={() => {
            setOtpSent(false)
            setOtp('')
            setError('')
            setMobileVerified(false)
          }}>
            Change Mobile Number
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}