export type OtpFlow = "SIGNUP_VERIFICATION" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";

export interface User { id: string; firstName: string; lastName: string | null; email: string | null; phoneNumber: string | null; countryCode: string | null; role: string | null; userType: string | null; status: string; emailVerified: boolean; }
export interface SignupRequest { firstName: string; lastName: string; email: string; phoneNumber: string; countryCode: string; password: string; confirmPassword: string; }
export interface LoginRequest { identifier: string; password: string; }
export interface TokenResponse { accessToken: string; tokenType: string; expiresIn: number; }
export interface AuthResponse extends TokenResponse { refreshToken: string; user: User; }
export interface VerifyOtpRequest { email: string; otp: string; flow: OtpFlow; }
export interface ResendOtpRequest { email: string; flow: OtpFlow; }
export type SendOtpRequest = ResendOtpRequest;
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; confirmPassword: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; confirmPassword: string; }
export interface SessionResponse { user: User; }
