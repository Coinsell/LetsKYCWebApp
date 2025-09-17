import { apiRequest } from './api';

export interface SendOTPRequest {
  mobileNumber: string;
  countryCode?: string;
}

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  otpId?: string;
}

export interface VerifyOTPRequest {
  mobileNumber: string;
  otp: string;
  otpId?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  verified: boolean;
}

export const otpApi = {
  async sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    return apiRequest<SendOTPResponse>('POST', '/otp/send', request);
  },

  async verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return apiRequest<VerifyOTPResponse>('POST', '/otp/verify', request);
  }
};
