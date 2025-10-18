import { Booking } from '../types';

const BOOKINGS_KEY = 'student_prep_hub_bookings';
const AUTH_KEY = 'student_prep_hub_auth';

export const getBookings = (): Booking[] => {
  const data = localStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const updateBookingStatus = (
  bookingId: string,
  status: 'accepted' | 'rejected'
): void => {
  const bookings = getBookings();
  const updatedBookings = bookings.map((b) =>
    b.id === bookingId ? { ...b, status } : b
  );
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
};

export const getCurrentUser = () => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: any) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};
