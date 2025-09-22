import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { LoadingSpinner } from '../ui/loading-spinner'
import { useKYC } from '../../contexts/KYCContext'
import { CheckCircle, Smartphone, Edit3 } from 'lucide-react'
import { otpApi } from '../../lib/otpapi'
import { isdCodeApi, ISDCode } from '../../lib/isdcodeapi'

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
  const [mobileVerified, setMobileVerified] = useState(false)
  const [isEditingMobile, setIsEditingMobile] = useState(false)
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [isdCodes, setIsdCodes] = useState<ISDCode[]>([])
  const [loadingIsdCodes, setLoadingIsdCodes] = useState(false)

  // Load ISD codes on component mount
  useEffect(() => {
    loadIsdCodes()
  }, [])

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

  const loadIsdCodes = async () => {
    try {
      setLoadingIsdCodes(true)
      const codes = await isdCodeApi.list()
      setIsdCodes(codes)
    } catch (error) {
      console.error('Error loading ISD codes:', error)
      // Fallback to common codes if API fails
      setIsdCodes([
        { sequence: 1, isdCode: 91, countryCode: 'IN', countryCode2: 'IND', countryName: 'India' },
        { sequence: 2, isdCode: 1, countryCode: 'US', countryCode2: 'USA', countryName: 'United States' },
        { sequence: 3, isdCode: 44, countryCode: 'GB', countryCode2: 'GBR', countryName: 'United Kingdom' },
        { sequence: 4, isdCode: 49, countryCode: 'DE', countryCode2: 'DEU', countryName: 'Germany' },
        { sequence: 5, isdCode: 33, countryCode: 'FR', countryCode2: 'FRA', countryName: 'France' },
        { sequence: 6, isdCode: 86, countryCode: 'CN', countryCode2: 'CHN', countryName: 'China' },
        { sequence: 7, isdCode: 81, countryCode: 'JP', countryCode2: 'JPN', countryName: 'Japan' },
        { sequence: 8, isdCode: 61, countryCode: 'AU', countryCode2: 'AUS', countryName: 'Australia' },
        { sequence: 9, isdCode: 55, countryCode: 'BR', countryCode2: 'BRA', countryName: 'Brazil' },
        { sequence: 10, isdCode: 7, countryCode: 'RU', countryCode2: 'RUS', countryName: 'Russia' },
        { sequence: 11, isdCode: 599, countryCode: 'AN', countryCode2: 'ANT', countryName: 'Netherlands Antilles' }
      ])
    } finally {
      setLoadingIsdCodes(false)
    }
  }

  const fullMobileNumber = `${countryCode}${mobileNumber}`
  const maskedMobile = mobileNumber 
    ? `${countryCode}-XXXXXX${mobileNumber.slice(-4)}`
    : `${countryCode}-XXXXXX`

  // Get country flag emoji based on country code
  const getCountryFlag = (countryCode: string) => {
    const flagMap: Record<string, string> = {
      // Complete country coverage - A
      'AD': '🇦🇩', 'AE': '🇦🇪', 'AF': '🇦🇫', 'AG': '🇦🇬', 'AI': '🇦🇮',
      'AL': '🇦🇱', 'AM': '🇦🇲', 'AO': '🇦🇴', 'AQ': '🇦🇶', 'AR': '🇦🇷',
      'AS': '🇦🇸', 'AT': '🇦🇹', 'AU': '🇦🇺', 'AW': '🇦🇼', 'AX': '🇦🇽',
      'AZ': '🇦🇿',
      
      // B
      'BA': '🇧🇦', 'BB': '🇧🇧', 'BD': '🇧🇩', 'BE': '🇧🇪', 'BF': '🇧🇫',
      'BG': '🇧🇬', 'BH': '🇧🇭', 'BI': '🇧🇮', 'BJ': '🇧🇯', 'BL': '🇧🇱',
      'BM': '🇧🇲', 'BN': '🇧🇳', 'BO': '🇧🇴', 'BQ': '🇧🇶', 'BR': '🇧🇷',
      'BS': '🇧🇸', 'BT': '🇧🇹', 'BV': '🇧🇻', 'BW': '🇧🇼', 'BY': '🇧🇾',
      'BZ': '🇧🇿',
      
      // C
      'CA': '🇨🇦', 'CC': '🇨🇨', 'CD': '🇨🇩', 'CF': '🇨🇫', 'CG': '🇨🇬',
      'CH': '🇨🇭', 'CI': '🇨🇮', 'CK': '🇨🇰', 'CL': '🇨🇱', 'CM': '🇨🇲',
      'CN': '🇨🇳', 'CO': '🇨🇴', 'CR': '🇨🇷', 'CU': '🇨🇺', 'CV': '🇨🇻',
      'CW': '🇨🇼', 'CX': '🇨🇽', 'CY': '🇨🇾', 'CZ': '🇨🇿',
      
      // D
      'DE': '🇩🇪', 'DJ': '🇩🇯', 'DK': '🇩🇰', 'DM': '🇩🇲', 'DO': '🇩🇴',
      'DZ': '🇩🇿',
      
      // E
      'EC': '🇪🇨', 'EE': '🇪🇪', 'EG': '🇪🇬', 'EH': '🇪🇭', 'ER': '🇪🇷',
      'ES': '🇪🇸', 'ET': '🇪🇹',
      
      // F
      'FI': '🇫🇮', 'FJ': '🇫🇯', 'FK': '🇫🇰', 'FM': '🇫🇲', 'FO': '🇫🇴',
      'FR': '🇫🇷',
      
      // G
      'GA': '🇬🇦', 'GB': '🇬🇧', 'GD': '🇬🇩', 'GE': '🇬🇪', 'GF': '🇬🇫',
      'GG': '🇬🇬', 'GH': '🇬🇭', 'GI': '🇬🇮', 'GL': '🇬🇱', 'GM': '🇬🇲',
      'GN': '🇬🇳', 'GP': '🇬🇵', 'GQ': '🇬🇶', 'GR': '🇬🇷', 'GS': '🇬🇸',
      'GT': '🇬🇹', 'GU': '🇬🇺', 'GW': '🇬🇼', 'GY': '🇬🇾',
      
      // H
      'HK': '🇭🇰', 'HM': '🇭🇲', 'HN': '🇭🇳', 'HR': '🇭🇷', 'HT': '🇭🇹',
      'HU': '🇭🇺',
      
      // I
      'ID': '🇮🇩', 'IE': '🇮🇪', 'IL': '🇮🇱', 'IM': '🇮🇲', 'IN': '🇮🇳',
      'IO': '🇮🇴', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'IS': '🇮🇸', 'IT': '🇮🇹',
      
      // J
      'JE': '🇯🇪', 'JM': '🇯🇲', 'JO': '🇯🇴', 'JP': '🇯🇵',
      
      // K
      'KE': '🇰🇪', 'KG': '🇰🇬', 'KH': '🇰🇭', 'KI': '🇰🇮', 'KM': '🇰🇲',
      'KN': '🇰🇳', 'KP': '🇰🇵', 'KR': '🇰🇷', 'KW': '🇰🇼', 'KY': '🇰🇾',
      'KZ': '🇰🇿',
      
      // L
      'LA': '🇱🇦', 'LB': '🇱🇧', 'LC': '🇱🇨', 'LI': '🇱🇮', 'LK': '🇱🇰',
      'LR': '🇱🇷', 'LS': '🇱🇸', 'LT': '🇱🇹', 'LU': '🇱🇺', 'LV': '🇱🇻',
      'LY': '🇱🇾',
      
      // M
      'MA': '🇲🇦', 'MC': '🇲🇨', 'MD': '🇲🇩', 'ME': '🇲🇪', 'MF': '🇲🇫',
      'MG': '🇲🇬', 'MH': '🇲🇭', 'MK': '🇲🇰', 'ML': '🇲🇱', 'MM': '🇲🇲',
      'MN': '🇲🇳', 'MO': '🇲🇴', 'MP': '🇲🇵', 'MQ': '🇲🇶', 'MR': '🇲🇷',
      'MS': '🇲🇸', 'MT': '🇲🇹', 'MU': '🇲🇺', 'MV': '🇲🇻', 'MW': '🇲🇼',
      'MX': '🇲🇽', 'MY': '🇲🇾', 'MZ': '🇲🇿',
      
      // N
      'NA': '🇳🇦', 'NC': '🇳🇨', 'NE': '🇳🇪', 'NF': '🇳🇫', 'NG': '🇳🇬',
      'NI': '🇳🇮', 'NL': '🇳🇱', 'NO': '🇳🇴', 'NP': '🇳🇵', 'NR': '🇳🇷',
      'NU': '🇳🇺', 'NZ': '🇳🇿',
      
      // O
      'OM': '🇴🇲',
      
      // P
      'PA': '🇵🇦', 'PE': '🇵🇪', 'PF': '🇵🇫', 'PG': '🇵🇬', 'PH': '🇵🇭',
      'PK': '🇵🇰', 'PL': '🇵🇱', 'PM': '🇵🇲', 'PN': '🇵🇳', 'PR': '🇵🇷',
      'PS': '🇵🇸', 'PT': '🇵🇹', 'PW': '🇵🇼', 'PY': '🇵🇾',
      
      // Q
      'QA': '🇶🇦',
      
      // R
      'RE': '🇷🇪', 'RO': '🇷🇴', 'RS': '🇷🇸', 'RU': '🇷🇺', 'RW': '🇷🇼',
      
      // S
      'SA': '🇸🇦', 'SB': '🇸🇧', 'SC': '🇸🇨', 'SD': '🇸🇩', 'SE': '🇸🇪',
      'SG': '🇸🇬', 'SH': '🇸🇭', 'SI': '🇸🇮', 'SJ': '🇸🇯', 'SK': '🇸🇰',
      'SL': '🇸🇱', 'SM': '🇸🇲', 'SN': '🇸🇳', 'SO': '🇸🇴', 'SR': '🇸🇷',
      'SS': '🇸🇸', 'ST': '🇸🇹', 'SV': '🇸🇻', 'SX': '🇸🇽', 'SY': '🇸🇾',
      'SZ': '🇸🇿',
      
      // T
      'TC': '🇹🇨', 'TD': '🇹🇩', 'TF': '🇹🇫', 'TG': '🇹🇬', 'TH': '🇹🇭',
      'TJ': '🇹🇯', 'TK': '🇹🇰', 'TL': '🇹🇱', 'TM': '🇹🇲', 'TN': '🇹🇳',
      'TO': '🇹🇴', 'TR': '🇹🇷', 'TT': '🇹🇹', 'TV': '🇹🇻', 'TW': '🇹🇼',
      'TZ': '🇹🇿',
      
      // U
      'UA': '🇺🇦', 'UG': '🇺🇬', 'UM': '🇺🇲', 'US': '🇺🇸', 'UY': '🇺🇾',
      'UZ': '🇺🇿',
      
      // V
      'VA': '🇻🇦', 'VC': '🇻🇨', 'VE': '🇻🇪', 'VG': '🇻🇬', 'VI': '🇻🇮',
      'VN': '🇻🇳', 'VU': '🇻🇺',
      
      // W
      'WF': '🇼🇫', 'WS': '🇼🇸',
      
      // X
      'XK': '🇽🇰',
      
      // Y
      'YE': '🇾🇪', 'YT': '🇾🇹',
      
      // Z
      'ZA': '🇿🇦', 'ZM': '🇿🇲', 'ZW': '🇿🇼'
    }
    
    const flag = flagMap[countryCode] || '🌍'
    return flag
  }

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
      // Temporary dummy OTP sending - simulate success
      console.log('Dummy OTP sent to:', fullMobileNumber)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setOtpSent(true)
      setCountdown(300) // 5 minutes
      setIsEditingMobile(false)
      console.log('Dummy OTP sent successfully - use code: 123456')
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
      // Temporary dummy OTP verification - accept any 6-digit code
      const dummyOTP = '123456'
      
      if (otp === dummyOTP) {
        setMobileVerified(true)
        dispatch({ type: 'SET_MOBILE_VERIFIED', payload: true })
        console.log('Dummy OTP verified successfully - using code: 123456')
        // Don't call onNext() immediately, let user see the success state
      } else {
        setError('Invalid OTP. Please use dummy code: 123456')
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
        {!isEditingMobile && mobileNumber && mobileNumber.length >= 10 ? (
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
                    {loadingIsdCodes ? (
                      <SelectItem value="loading" disabled>
                        <span className="flex items-center gap-2">
                          <LoadingSpinner fullscreen={false} />
                          <span>Loading...</span>
                        </span>
                      </SelectItem>
                    ) : (
                      isdCodes.map((isdCode, index) => (
                        <SelectItem key={`${isdCode.countryCode}-${isdCode.isdCode}-${index}`} value={`+${isdCode.isdCode}`}>
                          <span className="flex items-center gap-2">
                            <span>{getCountryFlag(isdCode.countryCode)}</span>
                            <span>+{isdCode.isdCode}</span>
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Input
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setMobileNumber(value)
                    if (error) setError('')
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-800 font-medium">
                  🧪 Development Mode: Use dummy OTP code <strong>123456</strong>
                </p>
              </div>
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