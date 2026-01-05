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
  // --------------------
  // LOGIN
  // --------------------
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

  // --------------------
  // REGISTER
  // --------------------
  static async register(
    data: RegisterRequest
  ): Promise<RegisterResponse> {
    return api.post('/accounts/register', data);
  }

  // --------------------
  // VERIFY OTP
  // --------------------
  static async verifyOTP(
    data: VerifyOTPRequest
  ): Promise<VerifyOTPResponse> {
    return api.patch('/accounts/register/verify', data);
  }

  // --------------------
  // CURRENT USER
  // --------------------
  static async getCurrentUser(): Promise<User> {
    const response: CurrentUserResponse = await api.get('/accounts/me');
    const userData = response.user;
    
    // Map backend user_id to frontend id and extract name fields
    const firstName = (userData as any).first_name || '';
    const lastName = (userData as any).last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return {
      id: (userData as any).user_id || (userData as any).id,
      email: userData.email,
      role: userData.role,
      name: fullName || userData.email,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      is_superuser: userData.is_superuser,
      is_approved_lister: userData.is_approved_lister,
      profile_image: userData.profile_image,
      phone_number: userData.phone_number,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      pincode: userData.pincode,
    };
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
