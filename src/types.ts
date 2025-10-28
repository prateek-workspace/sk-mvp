import { Database } from './types/supabase';

export type UserRole = Database['public']['Enums']['user_role'];

// This is now our primary User type, based on the 'profiles' table
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  type: 'coaching' | 'library' | 'pg' | 'tiffin';
  name: string;
  description: string;
  price: number;
  rating: number;
  location: string;
  image: string;
  features: string[];
  reviews: Review[];
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  amount: number;
}

export interface DashboardStats {
  todayRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  newClients: number;
  clientsChange: number;
  totalSales: number;
  salesChange: number;
}
