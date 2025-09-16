import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useKYC } from '../../contexts/KYCContext'
import { CheckCircle, Smartphone, Edit3 } from 'lucide-react'

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
  const [isEditingMobile, setIsEditingMobile] = useState(false)
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState('')

  // Initialize mobile number from KYC context or use empty for user input
  useEffect(() => {
    if (state.userInfo?.mobile) {
      const mobile = state.userInfo.mobile
      // Extract country code and number if mobile has country code
      if (mobile.startsWith('+')) {
        const match = mobile.match(/^(\+\d{1,3})(\d+)$/)
        if (match) {
          setCountryCode(match[1])
          setMobileNumber(match[2])
        } else {
          setCountryCode('+91')
          setMobileNumber(mobile)
        }
      } else {
        setCountryCode('+91')
        setMobileNumber(mobile)
      }
    }
  }, [state.userInfo?.mobile])

  const fullMobileNumber = `${countryCode}${mobileNumber}`
  const maskedMobile = mobileNumber 
    ? `${countryCode}-XXXXXX${mobileNumber.slice(-4)}`
    : `${countryCode}-XXXXXX`

  // Common country codes
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  ]

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // For demo purposes, simulate OTP sending
      console.log('Sending OTP to:', fullMobileNumber)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOtpSent(true)
      setCountdown(60)
      setIsEditingMobile(false)
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
        {/* Mobile Number Input or Display */}
        {!isEditingMobile && mobileNumber ? (
          <div className="bg-secondary-2 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-800">Mobile Number</p>
                <p className="text-neutral-600">{maskedMobile}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Unverified</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingMobile(true)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setMobileNumber(value)
                    setError('')
                  }}
                  placeholder="Enter mobile number"
                  className="flex-1"
                  maxLength={15}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        )}

        {!otpSent ? (
          <div className="text-center">
            <Button 
              onClick={sendOTP} 
              disabled={loading || !mobileNumber || mobileNumber.length < 10} 
              size="lg"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            {!mobileNumber && (
              <p className="text-sm text-neutral-500 mt-2">
                Please enter your mobile number to continue
              </p>
            )}
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
          {otpSent && (
            <Button 
              variant="link" 
              onClick={() => {
                setOtpSent(false)
                setOtp('')
                setError('')
                setMobileVerified(false)
                setIsEditingMobile(true)
              }}
            >
              Change Mobile Number
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}