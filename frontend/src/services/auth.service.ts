import api from '../utils/api';
import { User } from '../types';

export interface LoginRequest {
  username: string; // email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
}

export interface RegisterResponse {
  email: string;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  access_token: string;
  message: string;
}

export interface CurrentUserResponse {
  user: User;
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/accounts/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data;
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post('/accounts/register', data);
  }

  static async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return api.patch('/accounts/register/verify', data);
  }

  static async getCurrentUser(): Promise<User> {
    const response: CurrentUserResponse = await api.get('/accounts/me');
    return response.user;
  }

  static async logout(): Promise<void> {
    return api.post('/accounts/logout', {});
  }

  static async updateProfile(data: Partial<User>): Promise<User> {
    const response: CurrentUserResponse = await api.put('/accounts/me', data);
    return response.user;
  }

  static async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    return api.patch('/accounts/me/password', {
      old_password: oldPassword,
      password: newPassword,
      password_confirm: confirmPassword,
    });
  }

  static async resendOTP(email: string): Promise<void> {
    return api.post('/accounts/otp', { email });
  }
}
