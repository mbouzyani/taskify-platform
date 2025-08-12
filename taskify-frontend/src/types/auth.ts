export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  position?: string;
  department?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
  expiresAt: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  position: string;
  department?: string;
  lastLoginAt?: string;
}
