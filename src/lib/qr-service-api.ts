// QR Service API - Multi-tenant aware queries for QR room service

import { supabase } from './supabase'
import type {
  ServiceCategory,
  ServiceItem,
  ServiceOrder,
  ServiceOrderItem,
  RoomQRCode,
  CreateOrderData,
  OrderStatus
} from '../types/qr-service'

// Helper to get property_id from context or throw error
// Note: This reads from sessionStorage which is set by PropertyContext
// For React components, use usePropertyId() hook instead
function requirePropertyId(): number {
  const propertyId = sessionStorage.getItem('property_id')
  if (!propertyId || propertyId === 'null') {
    throw new Error('Property context is required but not available')
  }
  return parseInt(propertyId, 10)
}

// Helper for React components - pass propertyId from usePropertyId() hook
export function getPropertyIdForAPI(propertyId: string | null): number {
  if (!propertyId) {
    throw new Error('Property context is required but not available')
  }
  return parseInt(propertyId, 10)
}

// ============================================
// SERVICE CATEGORIES
// ============================================

export const serviceCategoriesApi = {
  async getAll(propertyId?: number): Promise<ServiceCategory[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('property_id', propId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getAllAdmin(propertyId?: number): Promise<ServiceCategory[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('property_id', propId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getById(id: number, propertyId?: number): Promise<ServiceCategory | null> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('property_id', propId)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(category: Partial<ServiceCategory>, propertyId?: number): Promise<ServiceCategory> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_categories')
      .insert([{ ...category, property_id: propId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<ServiceCategory>, propertyId?: number): Promise<ServiceCategory> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('property_id', propId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: number, propertyId?: number): Promise<void> {
    const propId = propertyId || requirePropertyId()
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('property_id', propId)
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================
// SERVICE ITEMS
// ============================================

export const serviceItemsApi = {
  async getAll(propertyId?: number): Promise<ServiceItem[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('property_id', propId)
      .eq('is_available', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getAllAdmin(propertyId?: number): Promise<ServiceItem[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('property_id', propId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getByCategory(categoryId: number, propertyId?: number): Promise<ServiceItem[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .select('*')
      .eq('property_id', propId)
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getById(id: number, propertyId?: number): Promise<ServiceItem | null> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .select(`
        *,
        category:service_categories(*)
      `)
      .eq('property_id', propId)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(item: Partial<ServiceItem>, propertyId?: number): Promise<ServiceItem> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .insert([{ ...item, property_id: propId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: number, updates: Partial<ServiceItem>, propertyId?: number): Promise<ServiceItem> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_items')
      .update(updates)
      .eq('property_id', propId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: number, propertyId?: number): Promise<void> {
    const propId = propertyId || requirePropertyId()
    const { error } = await supabase
      .from('service_items')
      .delete()
      .eq('property_id', propId)
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================
// SERVICE ORDERS
// ============================================

export const serviceOrdersApi = {
  async getAll(propertyId?: number): Promise<ServiceOrder[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        items:service_order_items(*),
        room:rooms(id, name, room_number)
      `)
      .eq('property_id', propId)
      .order('ordered_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: number, propertyId?: number): Promise<ServiceOrder | null> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        items:service_order_items(*),
        room:rooms(id, name, room_number)
      `)
      .eq('property_id', propId)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getByStatus(status: OrderStatus, propertyId?: number): Promise<ServiceOrder[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        items:service_order_items(*),
        room:rooms(id, name, room_number)
      `)
      .eq('property_id', propId)
      .eq('order_status', status)
      .order('ordered_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(orderData: CreateOrderData): Promise<ServiceOrder> {
    const { items, ...orderInfo } = orderData

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .insert([orderInfo])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('service_order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Fetch complete order with items
    return await this.getById(order.id, orderData.property_id) as ServiceOrder
  },

  async updateStatus(id: number, status: OrderStatus, propertyId?: number): Promise<ServiceOrder> {
    const propId = propertyId || requirePropertyId()
    const updates: any = { order_status: status }

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString()
    } else if (status === 'delivered') {
      updates.completed_at = new Date().toISOString()
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('service_orders')
      .update(updates)
      .eq('property_id', propId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async cancel(id: number, reason: string, propertyId?: number): Promise<ServiceOrder> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('service_orders')
      .update({
        order_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('property_id', propId)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ============================================
// ROOM QR CODES
// ============================================

export const roomQRCodesApi = {
  async getAll(propertyId?: number): Promise<RoomQRCode[]> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('room_qr_codes')
      .select(`
        *,
        room:rooms(id, name, room_number)
      `)
      .eq('property_id', propId)
      .order('room_id', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getByRoomId(roomId: number, propertyId?: number): Promise<RoomQRCode | null> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('room_qr_codes')
      .select(`
        *,
        room:rooms(id, name, room_number)
      `)
      .eq('property_id', propId)
      .eq('room_id', roomId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getByQRCode(qrCodeData: string): Promise<RoomQRCode | null> {
    const { data, error } = await supabase
      .from('room_qr_codes')
      .select(`
        *,
        room:rooms(id, name, room_number)
      `)
      .eq('qr_code_data', qrCodeData)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async create(roomId: number, qrCodeData: string, propertyId?: number): Promise<RoomQRCode> {
    const propId = propertyId || requirePropertyId()
    const { data, error } = await supabase
      .from('room_qr_codes')
      .insert([{
        property_id: propId,
        room_id: roomId,
        qr_code_data: qrCodeData,
        generated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateScanCount(qrCodeData: string): Promise<void> {
    const { error } = await supabase.rpc('increment_qr_scan_count', {
      qr_data: qrCodeData
    })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: qrCode } = await supabase
        .from('room_qr_codes')
        .select('id, scan_count')
        .eq('qr_code_data', qrCodeData)
        .single()

      if (qrCode) {
        await supabase
          .from('room_qr_codes')
          .update({
            scan_count: qrCode.scan_count + 1,
            last_scanned_at: new Date().toISOString()
          })
          .eq('id', qrCode.id)
      }
    }
  },

  async regenerate(roomId: number, newQRCodeData: string, propertyId?: number): Promise<RoomQRCode> {
    const propId = propertyId || requirePropertyId()
    
    // Delete old QR code
    await supabase
      .from('room_qr_codes')
      .delete()
      .eq('property_id', propId)
      .eq('room_id', roomId)

    // Create new one
    return await this.create(roomId, newQRCodeData, propId)
  }
}
