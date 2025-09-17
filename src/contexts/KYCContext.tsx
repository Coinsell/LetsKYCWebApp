import { createContext, useContext, useReducer, ReactNode } from 'react'
import { OccupationProfession } from '../lib/occupationprofessionapi'

export interface UserInfo {
  fullName: string
  dateOfBirth: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  country: string
  pan: string
  mobile: string
}

export interface KYCState {
  kycId: string | null
  userInfo: UserInfo | null
  mobileVerified: boolean
  panVerified: boolean
  panNameMatch: number | null
  aadhaarVerified: boolean
  aadhaarData: any | null
  livenessVerified: boolean
  faceMatchScore: number | null
  occupation: OccupationProfession | null
  profession: OccupationProfession | null
  finalStatus: 'NotStarted' | 'InProgress' | 'PendingReview' | 'Verified' | 'Rejected'
  currentStep: number
}

type KYCAction = 
  | { type: 'SET_USER_INFO'; payload: UserInfo }
  | { type: 'SET_MOBILE_VERIFIED'; payload: boolean }
  | { type: 'SET_PAN_VERIFIED'; payload: { verified: boolean; nameMatch?: number } }
  | { type: 'SET_AADHAAR_VERIFIED'; payload: { verified: boolean; data?: any } }
  | { type: 'SET_LIVENESS_VERIFIED'; payload: { verified: boolean; faceMatchScore?: number } }
  | { type: 'SET_OCCUPATION'; payload: OccupationProfession }
  | { type: 'SET_PROFESSION'; payload: OccupationProfession }
  | { type: 'SET_FINAL_STATUS'; payload: KYCState['finalStatus'] }
  | { type: 'SET_KYC_ID'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: number }

const initialState: KYCState = {
  kycId: null,
  userInfo: null,
  mobileVerified: false,
  panVerified: false,
  panNameMatch: null,
  aadhaarVerified: false,
  aadhaarData: null,
  livenessVerified: false,
  faceMatchScore: null,
  occupation: null,
  profession: null,
  finalStatus: 'NotStarted',
  currentStep: 0
}

function kycReducer(state: KYCState, action: KYCAction): KYCState {
  switch (action.type) {
    case 'SET_USER_INFO':
      return { ...state, userInfo: action.payload, finalStatus: 'InProgress' }
    case 'SET_MOBILE_VERIFIED':
      return { ...state, mobileVerified: action.payload }
    case 'SET_PAN_VERIFIED':
      return { 
        ...state, 
        panVerified: action.payload.verified,
        panNameMatch: action.payload.nameMatch || null
      }
    case 'SET_AADHAAR_VERIFIED':
      return { 
        ...state, 
        aadhaarVerified: action.payload.verified,
        aadhaarData: action.payload.data || null
      }
    case 'SET_LIVENESS_VERIFIED':
      return { 
        ...state, 
        livenessVerified: action.payload.verified,
        faceMatchScore: action.payload.faceMatchScore || null
      }
    case 'SET_OCCUPATION':
      return { ...state, occupation: action.payload }
    case 'SET_PROFESSION':
      return { ...state, profession: action.payload }
    case 'SET_FINAL_STATUS':
      return { ...state, finalStatus: action.payload }
    case 'SET_KYC_ID':
      return { ...state, kycId: action.payload }
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
    default:
      return state
  }
}

const KYCContext = createContext<{
  state: KYCState
  dispatch: React.Dispatch<KYCAction>
} | null>(null)

export function KYCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kycReducer, initialState)

  return (
    <KYCContext.Provider value={{ state, dispatch }}>
      {children}
    </KYCContext.Provider>
  )
}

export function useKYC() {
  const context = useContext(KYCContext)
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider')
  }
  return context
}