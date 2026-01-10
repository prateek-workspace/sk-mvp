// This is now our primary User type
export interface User {
  full_name: string;
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin' | 'hostel' | 'coaching' | 'library' | 'tiffin';
  is_superuser?: boolean;
  is_approved_lister?: boolean;
  profile_image?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Faculty {
  id?: number;
  listing_id?: number;
  name: string;
  subject: string;
  image_url?: string;
}

// This type is now mainly for the mock data on the landing page.
// The new Supabase-driven parts will use types generated from the DB schema.
export interface Listing {
  id: number;
  owner_id: number;
  type: 'coaching' | 'library' | 'pg' | 'tiffin' | 'hostel';
  name: string;
  description: string;
  price: number;
  rating?: number;
  location: string;
  image_url?: string;
  features?: string[];
  amenities?: string[];
  reviews?: Review[];
  faculty?: Faculty[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  listing_id: number;
  user_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlist' | 'cancelled';
  amount: number;
  quantity: number;
  payment_id?: string;
  payment_screenshot?: string;
  payment_verified: boolean;
  payment_status?: 'pending' | 'verified' | 'fake';
  payment_verified_at?: string;
  created_at: string;
  updated_at?: string;
  listing?: Listing;
  user?: User;
}

export interface BookingWithQR {
  booking: Booking;
  qr_code: string;
  upi_id: string;
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
