import api from '../utils/api';
import { Listing } from '../types';

export interface ListingCreateRequest {
  name: string;
  description?: string;
  price: number;
  location?: string;
  features?: string[];
  type: 'coaching' | 'library' | 'pg' | 'tiffin' | 'hostel';
}

export interface ListingUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  location?: string;
  features?: string[];
  image_url?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
}

export class ListingsService {
  static async getListings(type?: string, ownerId?: number): Promise<Listing[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (ownerId) params.append('owner_id', ownerId.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response: ListingsResponse = await api.get(`/listings/${query}`);
    return response.listings;
  }

  static async getListing(id: number): Promise<Listing> {
    return api.get(`/listings/${id}`);
  }

  static async createListing(data: ListingCreateRequest): Promise<Listing> {
    return api.post('/listings/', data);
  }

  static async updateListing(id: number, data: ListingUpdateRequest): Promise<Listing> {
    return api.put(`/listings/${id}`, data);
  }

  static async deleteListing(id: number): Promise<void> {
    return api.delete(`/listings/${id}`);
  }

  static async uploadListingImage(id: number, file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(`/listings/${id}/media`, formData);
  }
}
