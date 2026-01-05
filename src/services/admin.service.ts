import api from '../utils/api';
import { User } from '../types';

export interface UserListItem {
  date_joined: string | number | Date;
  is_verified_email: any;
  is_verified_email: any;
  is_active: any;
  is_active: any;
  is_active: unknown;
  id: number;
  email: string;
  name: string;
  role: string;
  is_superuser: boolean;
  is_approved_lister: boolean;
}

export interface UsersListResponse {
  users: UserListItem[];
  total: number;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'admin' | 'hostel' | 'coaching' | 'library' | 'tiffin';
}

export interface ApproveListerRequest {
  approve: boolean;
}

export interface ApproveListerResponse {
  message: string;
  user: UserListItem;
}

export interface DeleteUserResponse {
  message: string;
}

export class AdminService {
  static async getAllUsers(skip: number = 0, limit: number = 100): Promise<UserListItem[]> {
    const response: UsersListResponse = await api.get(`/accounts/admin/users?skip=${skip}&limit=${limit}`);
    return response.users;
  }

  static async updateUserRole(userId: number, role: string): Promise<void> {
    return api.patch(`/accounts/admin/users/${userId}/role`, { role });
  }

  static async approveLister(userId: number, approve: boolean): Promise<ApproveListerResponse> {
    return api.post(`/accounts/admin/users/${userId}/approve-lister`, { approve });
  }

  static async deleteUser(userId: number): Promise<DeleteUserResponse> {
    return api.delete(`/accounts/admin/users/${userId}`);
  }
}
