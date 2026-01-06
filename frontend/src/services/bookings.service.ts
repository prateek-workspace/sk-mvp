import api from '../utils/api';
import { Booking, BookingWithQR } from '../types';

export interface BookingCreateRequest {
  listing_id: number;
  quantity: number;
  payment_id?: string;
  payment_screenshot?: string;
}

export interface PaymentProofRequest {
  payment_id: string;
  payment_screenshot: string;
}

export interface BookingStatusRequest {
  status: 'accepted' | 'rejected' | 'waitlist';
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
}

export interface PaymentInfo {
  payment_qr_code: string | null;
  payment_upi_id: string | null;
}

export class BookingsService {
  static async getPaymentInfo(): Promise<PaymentInfo> {
    return api.get('/bookings/payment-info');
  }

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

  static async updateBookingStatus(bookingId: number, data: BookingStatusRequest): Promise<Booking> {
    return api.patch(`/bookings/${bookingId}/status`, data);
  }

  static async verifyPayment(bookingId: number, verified: boolean, notes?: string): Promise<Booking> {
    return api.patch(`/bookings/${bookingId}/verify-payment`, {
      payment_verified: verified,
      notes,
    });
  }

  static async getAllBookingsAdmin(): Promise<Booking[]> {
    const response = await api.get('/bookings/admin/all');
    // Backend returns array directly, not wrapped in object
    return Array.isArray(response) ? response : [];
  }

  static async updateBooking(id: number, data: Partial<BookingCreateRequest>): Promise<Booking> {
    return api.put(`/bookings/${id}`, data);
  }

  static async deleteBooking(id: number): Promise<void> {
    return api.delete(`/bookings/${id}`);
  }
}
