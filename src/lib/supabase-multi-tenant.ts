// ============================================
// Supabase Multi-Tenant Query Helpers
// ============================================
// Helper functions to ensure all queries are filtered by property_id

import { supabase } from './supabase';
import { getCurrentPropertyId } from './property-context';

/**
 * Get the current property ID or throw an error
 * Use this in functions that require a property context
 */
export function requirePropertyId(): string {
  const propertyId = getCurrentPropertyId();
  if (!propertyId) {
    throw new Error('Property context is required but not available');
  }
  return propertyId;
}

/**
 * Create a Supabase query builder with automatic property_id filtering
 * Usage: const query = createPropertyQuery('rooms').select('*');
 */
export function createPropertyQuery(tableName: string) {
  const propertyId = requirePropertyId();
  return supabase.from(tableName).select('*').eq('property_id', propertyId);
}

// ============================================
// Typed Query Helpers for Each Table
// ============================================

/**
 * Rooms queries with property filtering
 */
export const roomsQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('room_number');
  },
  
  getById: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .eq('id', id)
      .single();
  },
  
  getBySlug: (slug: string) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .eq('slug', slug)
      .single();
  },
  
  create: (roomData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .insert({ ...roomData, property_id: propertyId })
      .select()
      .single();
  },
  
  update: (id: number, roomData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .update(roomData)
      .eq('property_id', propertyId)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('rooms')
      .delete()
      .eq('property_id', propertyId)
      .eq('id', id);
  },
};

/**
 * Bookings queries with property filtering
 */
export const bookingsQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
  },
  
  getById: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('property_id', propertyId)
      .eq('id', id)
      .single();
  },
  
  getByDateRange: (startDate: string, endDate: string) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .gte('check_in_date', startDate)
      .lte('check_out_date', endDate);
  },
  
  create: (bookingData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('bookings')
      .insert({ ...bookingData, property_id: propertyId })
      .select()
      .single();
  },
  
  update: (id: number, bookingData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('bookings')
      .update(bookingData)
      .eq('property_id', propertyId)
      .eq('id', id)
      .select()
      .single();
  },
};

/**
 * Blocked Dates queries with property filtering
 */
export const blockedDatesQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('blocked_dates')
      .select('*')
      .eq('property_id', propertyId)
      .order('start_date');
  },
  
  getByRoomId: (roomId: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('blocked_dates')
      .select('*')
      .eq('property_id', propertyId)
      .eq('room_id', roomId)
      .order('start_date');
  },
  
  create: (blockedDateData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('blocked_dates')
      .insert({ ...blockedDateData, property_id: propertyId })
      .select()
      .single();
  },
  
  delete: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('blocked_dates')
      .delete()
      .eq('property_id', propertyId)
      .eq('id', id);
  },
};

/**
 * Tourist Attractions queries with property filtering
 */
export const attractionsQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('tourist_attractions')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('display_order');
  },
  
  create: (attractionData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('tourist_attractions')
      .insert({ ...attractionData, property_id: propertyId })
      .select()
      .single();
  },
  
  update: (id: number, attractionData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('tourist_attractions')
      .update(attractionData)
      .eq('property_id', propertyId)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('tourist_attractions')
      .delete()
      .eq('property_id', propertyId)
      .eq('id', id);
  },
};

/**
 * Facilities queries with property filtering
 */
export const facilitiesQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('facilities')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true);
  },
  
  create: (facilityData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('facilities')
      .insert({ ...facilityData, property_id: propertyId })
      .select()
      .single();
  },
  
  update: (id: number, facilityData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('facilities')
      .update(facilityData)
      .eq('property_id', propertyId)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('facilities')
      .delete()
      .eq('property_id', propertyId)
      .eq('id', id);
  },
};

/**
 * Testimonials queries with property filtering
 */
export const testimonialsQuery = {
  getAll: () => {
    const propertyId = requirePropertyId();
    return supabase
      .from('testimonials')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  },
  
  create: (testimonialData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('testimonials')
      .insert({ ...testimonialData, property_id: propertyId })
      .select()
      .single();
  },
  
  update: (id: number, testimonialData: any) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('testimonials')
      .update(testimonialData)
      .eq('property_id', propertyId)
      .eq('id', id)
      .select()
      .single();
  },
  
  delete: (id: number) => {
    const propertyId = requirePropertyId();
    return supabase
      .from('testimonials')
      .delete()
      .eq('property_id', propertyId)
      .eq('id', id);
  },
};
