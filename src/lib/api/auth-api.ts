import { apiClient } from "./api-client";
import type { AuthResponse, ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, ResendOtpRequest, ResetPasswordRequest, SignupRequest, TokenResponse, User, VerifyOtpRequest } from "@/types/auth";

export const authApi = {
  signup: (body: SignupRequest) => apiClient.post<void>("/auth/signup", body),
  login: (body: LoginRequest) => apiClient.post<AuthResponse>("/auth/login", body),
  verifyOtp: (body: VerifyOtpRequest) => apiClient.post<void>("/auth/verify-otp", body),
  resendOtp: (body: ResendOtpRequest) => apiClient.post<void>("/auth/resend-otp", body),
  forgotPassword: (body: ForgotPasswordRequest) => apiClient.post<void>("/auth/forgot-password", body),
  resetPassword: (body: ResetPasswordRequest) => apiClient.post<void>("/auth/reset-password", body),
  changePassword: (body: ChangePasswordRequest) => apiClient.post<void>("/auth/change-password", body),
  logout: (refreshToken: string) => apiClient.post<void>("/auth/logout", { refreshToken }),
  logoutAll: () => apiClient.post<void>("/auth/logout-all"),
  getCurrentUser: () => apiClient.get<User>("/auth/me"),
  refreshToken: (refreshToken: string) => apiClient.post<TokenResponse>("/auth/refresh", { refreshToken }),
};
export type AuthApiResult<T> = Promise<T>;
