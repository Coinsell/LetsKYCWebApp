import { createContext, useContext, useReducer, ReactNode } from "react";

export interface KYCLevel {
  id: string;
  kycLevelId: string;
  code: string;
  description: string;
  status: KYCStatus;
  maxDepositAmount?: number;
  maxWithdrawalAmount?: number;
  duration: number;
  timeUnit: TimeUnit;
}

export interface KYCDetail {
  id: string;
  kycLevelId: string;
  sequence: number;
  step: string;
  description: string;
  type: KycDetailType;
  status: KYCStatus;
  hasAttachments: boolean;
  attachments?: Attachment[];
}

export interface User {
  id: string;
  userId: string;
  docType: string;
  firstName: string;
  lastName: string;
  login: string;
  dateOfBirth: string; // ISO datetime string
  country: string;
  contacts: Contact;
  idProof?: string;
  addressProof?: string;
  kycLevelId?: string;
  kycStatus: KYCStatus;
  kycJourneyLink?: string;
  kycJourneyStatus: KycJourneyStatus;
  remarks?: string;
  createdAt: string; // ISO datetime string
  updatedAt?: string; // ISO datetime string
}

export interface UserKYCLevel {
  id: string;
  userId: string;
  userKycLevelId: string;
  code: string;
  description: string;
  status: KYCStatus;
  maxDepositAmount?: number;
  maxWithdrawalAmount?: number;
  duration: number;
  timeUnit: TimeUnit;
  docType: string;
  lastUpdated: string; // ISO datetime string
}

export interface UserKYCDetail {
  id: string;
  userId: string;
  userKycDetailId: string;
  userKycLevelId: string;
  sequence: number;
  step: string;
  description: string;
  type: KycDetailType;
  status: KYCStatus;
  hasAttachments: boolean;
  attachments: Attachment[];
  docType: string;
  lastUpdated: string; // ISO datetime string
}

export interface UserKYCUpdate {
  id: string;
  userId: string;
  updateType: string;
  oldValue?: string;
  newValue?: string;
  status: KYCStatus;
  createdAt: string;
  updatedAt?: string;
}

export enum KYCStatus {
  NotSubmitted = "NotSubmitted",
  InProgress = "InProgress",
  Submitted = "Submitted",
  UnderReview = "UnderReview",
  Approved = "Approved",
  Rejected = "Rejected",
}

export enum KycDetailType {
  general = "general",
  phoneNo = "phoneNo",
  address = "address",
  addressProof = "addressProof",
  selfie = "selfie",
  identityProof = "identityProof",
  occupation = "occupation",
  pepDeclaration = "pepDeclaration",
  userInfo = "userInfo",
  aadhaar = "aadhaar",
  pan = "pan",
  liveliness = "liveliness",
}

export enum TimeUnit {
  Year = "Year",
  Month = "Month",
  Day = "Day",
  Hour = "Hour",
  Minute = "Minute",
  Second = "Second",
  MilliSecond = "MilliSecond",
}

export enum KycJourneyStatus {
  NotGenerated = 0,
  Generated = 1,
  Sent = 2,
}

export interface Contact {
  emails: string[];
  phoneNumbers: PhoneNumber[];
  addresses: Address[];
}

export interface PhoneNumber {
  countryCode: string;
  phone: string;
  type?: string;
  isPrimary: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type?: string;
  isPrimary: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
}

export interface KYCAdminState {
  countries: Country[];
  assignments: CountryKycAssignment[];
  kycLevels: KYCLevel[];
  kycDetails: KYCDetail[];
  users: User[];
  userKycLevels: UserKYCLevel[];
  userKycDetails: UserKYCDetail[];
  userKycUpdates: UserKYCUpdate[];
  loading: boolean;
  error: string | null;
}

// --------------------- Country ---------------------
export interface Country {
  id: string;
  sequence: number;
  code: string;
  name: string;
  isRegistrationRestricted: boolean;
}

// --------------------- Country KYC Assignment ---------------------
export interface CountryKycAssignment {
  id: string;
  countryCode: string;
  kycLevelId: string;
  isActive: boolean;
}

type KYCAdminAction =
  // Countries
  | { type: "SET_COUNTRIES"; payload: Country[] }
  | { type: "ADD_COUNTRY"; payload: Country }
  | { type: "UPDATE_COUNTRY"; payload: Country }
  | { type: "DELETE_COUNTRY"; payload: string }
  // Assignments
  | { type: "SET_ASSIGNMENTS"; payload: CountryKycAssignment[] }
  | { type: "ADD_ASSIGNMENT"; payload: CountryKycAssignment }
  | { type: "UPDATE_ASSIGNMENT"; payload: CountryKycAssignment }
  | { type: "DELETE_ASSIGNMENT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_KYC_LEVELS"; payload: KYCLevel[] }
  | { type: "ADD_KYC_LEVEL"; payload: KYCLevel }
  | { type: "UPDATE_KYC_LEVEL"; payload: KYCLevel }
  | { type: "DELETE_KYC_LEVEL"; payload: string }
  | { type: "SET_KYC_DETAILS"; payload: KYCDetail[] }
  | { type: "ADD_KYC_DETAIL"; payload: KYCDetail }
  | { type: "UPDATE_KYC_DETAIL"; payload: KYCDetail }
  | { type: "DELETE_KYC_DETAIL"; payload: string }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "SET_USER_KYC_LEVELS"; payload: UserKYCLevel[] }
  | { type: "ADD_USER_KYC_LEVEL"; payload: UserKYCLevel }
  | { type: "UPDATE_USER_KYC_LEVEL"; payload: UserKYCLevel }
  | { type: "DELETE_USER_KYC_LEVEL"; payload: string }
  | { type: "SET_USER_KYC_DETAILS"; payload: UserKYCDetail[] }
  | { type: "ADD_USER_KYC_DETAIL"; payload: UserKYCDetail }
  | { type: "UPDATE_USER_KYC_DETAIL"; payload: UserKYCDetail }
  | { type: "DELETE_USER_KYC_DETAIL"; payload: string }
  | { type: "SET_USER_KYC_UPDATES"; payload: UserKYCUpdate[] }
  | { type: "ADD_USER_KYC_UPDATE"; payload: UserKYCUpdate };

const initialState: KYCAdminState = {
  kycLevels: [],
  kycDetails: [],
  users: [],
  userKycLevels: [],
  userKycDetails: [],
  userKycUpdates: [],
  loading: false,
  error: null,
  countries: [],
  assignments: [],
};

function kycAdminReducer(
  state: KYCAdminState,
  action: KYCAdminAction
): KYCAdminState {
  switch (action.type) {
    // Countries
    case "SET_COUNTRIES":
      return { ...state, countries: action.payload };
    case "ADD_COUNTRY":
      return { ...state, countries: [...state.countries, action.payload] };
    case "UPDATE_COUNTRY":
      return {
        ...state,
        countries: state.countries.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_COUNTRY":
      return {
        ...state,
        countries: state.countries.filter((c) => c.id !== action.payload),
      };

    // Assignments
    case "SET_ASSIGNMENTS":
      return { ...state, assignments: action.payload };
    case "ADD_ASSIGNMENT":
      return { ...state, assignments: [...state.assignments, action.payload] };
    case "UPDATE_ASSIGNMENT":
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case "DELETE_ASSIGNMENT":
      return {
        ...state,
        assignments: state.assignments.filter((a) => a.id !== action.payload),
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_KYC_LEVELS":
      return { ...state, kycLevels: action.payload };
    case "ADD_KYC_LEVEL":
      return { ...state, kycLevels: [...state.kycLevels, action.payload] };
    case "UPDATE_KYC_LEVEL":
      return {
        ...state,
        kycLevels: state.kycLevels.map((level) =>
          level.id === action.payload.id ? action.payload : level
        ),
      };
    case "DELETE_KYC_LEVEL":
      return {
        ...state,
        kycLevels: state.kycLevels.filter(
          (level) => level.id !== action.payload
        ),
      };
    case "SET_KYC_DETAILS":
      return { ...state, kycDetails: action.payload };
    case "ADD_KYC_DETAIL":
      return { ...state, kycDetails: [...state.kycDetails, action.payload] };
    case "UPDATE_KYC_DETAIL":
      return {
        ...state,
        kycDetails: state.kycDetails.map((detail) =>
          detail.id === action.payload.id ? action.payload : detail
        ),
      };
    case "DELETE_KYC_DETAIL":
      return {
        ...state,
        kycDetails: state.kycDetails.filter(
          (detail) => detail.id !== action.payload
        ),
      };
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };
    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      };
    case "SET_USER_KYC_LEVELS":
      return { ...state, userKycLevels: action.payload };
    case "ADD_USER_KYC_LEVEL":
      return {
        ...state,
        userKycLevels: [...state.userKycLevels, action.payload],
      };
    case "UPDATE_USER_KYC_LEVEL":
      return {
        ...state,
        userKycLevels: state.userKycLevels.map((level) =>
          level.id === action.payload.id ? action.payload : level
        ),
      };
    case "DELETE_USER_KYC_LEVEL":
      return {
        ...state,
        userKycLevels: state.userKycLevels.filter(
          (level) => level.id !== action.payload
        ),
      };
    case "SET_USER_KYC_DETAILS":
      return { ...state, userKycDetails: action.payload };
    case "ADD_USER_KYC_DETAIL":
      return {
        ...state,
        userKycDetails: [...state.userKycDetails, action.payload],
      };
    case "UPDATE_USER_KYC_DETAIL":
      return {
        ...state,
        userKycDetails: state.userKycDetails.map((detail) =>
          detail.id === action.payload.id ? action.payload : detail
        ),
      };
    case "DELETE_USER_KYC_DETAIL":
      return {
        ...state,
        userKycDetails: state.userKycDetails.filter(
          (detail) => detail.id !== action.payload
        ),
      };
    case "SET_USER_KYC_UPDATES":
      return { ...state, userKycUpdates: action.payload };
    case "ADD_USER_KYC_UPDATE":
      return {
        ...state,
        userKycUpdates: [...state.userKycUpdates, action.payload],
      };
    default:
      return state;
  }
}

const KYCAdminContext = createContext<{
  state: KYCAdminState;
  dispatch: React.Dispatch<KYCAdminAction>;
} | null>(null);

export function KYCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(kycAdminReducer, initialState);

  return (
    <KYCAdminContext.Provider value={{ state, dispatch }}>
      {children}
    </KYCAdminContext.Provider>
  );
}

export function useKYCAdmin() {
  const context = useContext(KYCAdminContext);
  if (!context) {
    throw new Error("useKYCAdmin must be used within a KYCProvider");
  }
  return context;
}
