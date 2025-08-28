import { createContext, useContext, useReducer, ReactNode } from 'react'

export interface KYCLevel {
  id: string
  kycLevelId: string
  code: string
  description: string
  status: KYCStatus
  maxDepositAmount?: number
  maxWithdrawalAmount?: number
  duration: number
  timeUnit: TimeUnit
}

export interface KYCDetail {
  id: string
  kycLevelId: string
  sequence: number
  step: string
  description: string
  type: KycDetailType
  status: KYCStatus
  hasAttachments: boolean
  attachments?: Attachment[]
}

export interface User {
  id: string
  userId: string
  first_name: string
  last_name: string
  login: string
  date_of_birth: string
  country: string
  contacts: Contact
  id_proof?: string
  address_proof?: string
  kyc_level_id?: string
  kyc_status: KYCStatus
  remarks?: string
  created_at: string
  updated_at?: string
}

export interface UserKYCLevel {
  id: string
  userId: string
  userKycLevelId: string
  code: string
  description: string
  status: KYCStatus
  maxDepositAmount?: number
  maxWithdrawalAmount?: number
  duration: number
  timeUnit: TimeUnit
}

export interface UserKYCDetail {
  id: string
  userId: string
  userKycLevelId: string
  sequence: number
  step: string
  description: string
  type: KycDetailType
  status: KYCStatus
  hasAttachments: boolean
  attachments?: Attachment[]
}

export interface UserKYCUpdate {
  id: string
  userId: string
  updateType: string
  oldValue?: string
  newValue?: string
  status: KYCStatus
  createdAt: string
  updatedAt?: string
}

export enum KYCStatus {
  NotSubmitted = "NotSubmitted",
  InProgress = "InProgress",
  Submitted = "Submitted",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected"
}

export enum KycDetailType {
  general = "general",
  phoneNo = "phoneNo",
  address = "address",
  addressProof = "addressProof",
  selfie = "selfie",
  identityProof = "identityProof",
  occupation = "occupation",
  pepDeclaration = "pepDeclaration"
}

export enum TimeUnit {
  days = "days",
  months = "months",
  years = "years"
}

export interface Contact {
  emails: string[]
  phone_numbers: PhoneNumber[]
  addresses: Address[]
}

export interface PhoneNumber {
  country_code: string
  phone_number: string
  type?: string
  is_primary: boolean
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  type?: string
  is_primary: boolean
}

export interface Attachment {
  id: string
  filename: string
  url: string
  type: string
}

export interface KYCAdminState {
  kycLevels: KYCLevel[]
  kycDetails: KYCDetail[]
  users: User[]
  userKycLevels: UserKYCLevel[]
  userKycDetails: UserKYCDetail[]
  userKycUpdates: UserKYCUpdate[]
  loading: boolean
  error: string | null
}

type KYCAdminAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_KYC_LEVELS'; payload: KYCLevel[] }
  | { type: 'ADD_KYC_LEVEL'; payload: KYCLevel }
  | { type: 'UPDATE_KYC_LEVEL'; payload: KYCLevel }
  | { type: 'DELETE_KYC_LEVEL'; payload: string }
  | { type: 'SET_KYC_DETAILS'; payload: KYCDetail[] }
  | { type: 'ADD_KYC_DETAIL'; payload: KYCDetail }
  | { type: 'UPDATE_KYC_DETAIL'; payload: KYCDetail }
  | { type: 'DELETE_KYC_DETAIL'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_USER_KYC_LEVELS'; payload: UserKYCLevel[] }
  | { type: 'ADD_USER_KYC_LEVEL'; payload: UserKYCLevel }
  | { type: 'UPDATE_USER_KYC_LEVEL'; payload: UserKYCLevel }
  | { type: 'DELETE_USER_KYC_LEVEL'; payload: string }
  | { type: 'SET_USER_KYC_DETAILS'; payload: UserKYCDetail[] }
  | { type: 'ADD_USER_KYC_DETAIL'; payload: UserKYCDetail }
  | { type: 'UPDATE_USER_KYC_DETAIL'; payload: UserKYCDetail }
  | { type: 'DELETE_USER_KYC_DETAIL'; payload: string }
  | { type: 'SET_USER_KYC_UPDATES'; payload: UserKYCUpdate[] }
  | { type: 'ADD_USER_KYC_UPDATE'; payload: UserKYCUpdate }

const initialState: KYCAdminState = {
  kycLevels: [],
  kycDetails: [],
  users: [],
  userKycLevels: [],
  userKycDetails: [],
  userKycUpdates: [],
  loading: false,
  error: null
}

function kycAdminReducer(state: KYCAdminState, action: KYCAdminAction): KYCAdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_KYC_LEVELS':
      return { ...state, kycLevels: action.payload }
    case 'ADD_KYC_LEVEL':
      return { ...state, kycLevels: [...state.kycLevels, action.payload] }
    case 'UPDATE_KYC_LEVEL':
      return {
        ...state,
        kycLevels: state.kycLevels.map(level =>
          level.id === action.payload.id ? action.payload : level
        )
      }
    case 'DELETE_KYC_LEVEL':
      return {
        ...state,
        kycLevels: state.kycLevels.filter(level => level.id !== action.payload)
      }
    case 'SET_KYC_DETAILS':
      return { ...state, kycDetails: action.payload }
    case 'ADD_KYC_DETAIL':
      return { ...state, kycDetails: [...state.kycDetails, action.payload] }
    case 'UPDATE_KYC_DETAIL':
      return {
        ...state,
        kycDetails: state.kycDetails.map(detail =>
          detail.id === action.payload.id ? action.payload : detail
        )
      }
    case 'DELETE_KYC_DETAIL':
      return {
        ...state,
        kycDetails: state.kycDetails.filter(detail => detail.id !== action.payload)
      }
    case 'SET_USERS':
      return { ...state, users: action.payload }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] }
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      }
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      }
    case 'SET_USER_KYC_LEVELS':
      return { ...state, userKycLevels: action.payload }
    case 'ADD_USER_KYC_LEVEL':
      return { ...state, userKycLevels: [...state.userKycLevels, action.payload] }
    case 'UPDATE_USER_KYC_LEVEL':
      return {
        ...state,
        userKycLevels: state.userKycLevels.map(level =>
          level.id === action.payload.id ? action.payload : level
        )
      }
    case 'DELETE_USER_KYC_LEVEL':
      return {
        ...state,
        userKycLevels: state.userKycLevels.filter(level => level.id !== action.payload)
      }
    case 'SET_USER_KYC_DETAILS':
      return { ...state, userKycDetails: action.payload }
    case 'ADD_USER_KYC_DETAIL':
      return { ...state, userKycDetails: [...state.userKycDetails, action.payload] }
    case 'UPDATE_USER_KYC_DETAIL':
      return {
        ...state,
        userKycDetails: state.userKycDetails.map(detail =>
          detail.id === action.payload.id ? action.payload : detail
        )
      }
    case 'DELETE_USER_KYC_DETAIL':
      return {
        ...state,
        userKycDetails: state.userKycDetails.filter(detail => detail.id !== action.payload)
      }
    case 'SET_USER_KYC_UPDATES':
      return { ...state, userKycUpdates: action.payload }
    case 'ADD_USER_KYC_UPDATE':
      return { ...state, userKycUpdates: [...state.userKycUpdates, action.payload] }
    default:
      return state
  }
}

const KYCAdminContext = createContext<{
  state: KYCAdminState
  dispatch: React.Dispatch<KYCAdminAction>
} | null>(null)

export function KYCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kycAdminReducer, initialState)

  return (
    <KYCAdminContext.Provider value={{ state, dispatch }}>
      {children}
    </KYCAdminContext.Provider>
  )
}

export function useKYCAdmin() {
  const context = useContext(KYCAdminContext)
  if (!context) {
    throw new Error('useKYCAdmin must be used within a KYCProvider')
  }
  return context
}