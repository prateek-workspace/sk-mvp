import api from '../utils/api';
import { Booking, BookingWithQR } from '../types';

export interface BookingCreateRequest {
  listing_id: number;
  amount: number;
  status?: string;
}

export interface PaymentProofRequest {
  payment_id: string;
  payment_screenshot: string;
}

export interface BookingStatusRequest {
  status: 'accepted' | 'rejected';
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
}

export class BookingsService {
  static async createBooking(data: BookingCreateRequest): Promise<BookingWithQR> {
    return api.post('/bookings/', data);
  }

  static async getBookings(listingId?: number): Promise<Booking[]> {
    const query = listingId ? `?listing_id=${listingId}` : '';
    const response: BookingsResponse = await api.get(`/bookings/${query}`);
    return response.bookings;
  }

  static async getBooking(id: number): Promise<Booking> {
    return api.get(`/bookings/${id}`);
  }

  static async uploadPaymentProof(bookingId: number, data: PaymentProofRequest): Promise<Booking> {
    return api.post(`/bookings/${bookingId}/payment`, data);
  }

  static async updateBookingStatus(bookingId: number, status: 'accepted' | 'rejected'): Promise<Booking> {
    return api.patch(`/bookings/${bookingId}/status`, { status });
  }

  static async getAllBookingsAdmin(): Promise<Booking[]> {
    const response: BookingsResponse = await api.get('/bookings/admin/all');
    return response.bookings;
  }

  static async updateBooking(id: number, data: Partial<BookingCreateRequest>): Promise<Booking> {
    return api.put(`/bookings/${id}`, data);
  }

  static async deleteBooking(id: number): Promise<void> {
    return api.delete(`/bookings/${id}`);
  }
}
