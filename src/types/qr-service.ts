// QR Service Types for Phase 2

export interface ServiceCategory {
  id: number
  property_id: number
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceItem {
  id: number
  property_id: number
  category_id: number | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  preparation_time: number | null
  display_order: number
  tags: string[] | null
  created_at: string
  updated_at: string
  category?: ServiceCategory
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface ServiceOrder {
  id: number
  property_id: number
  room_id: number | null
  booking_id: number | null
  guest_name: string | null
  room_number: string
  phone: string | null
  order_status: OrderStatus
  total_amount: number
  special_instructions: string | null
  ordered_at: string
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  items?: ServiceOrderItem[]
  room?: {
    id: number
    name: string
    room_number: string
  }
}

export interface ServiceOrderItem {
  id: number
  order_id: number
  service_item_id: number | null
  item_name: string
  item_description: string | null
  quantity: number
  unit_price: number
  subtotal: number
  special_notes: string | null
  created_at: string
  service_item?: ServiceItem
}

export interface RoomQRCode {
  id: number
  property_id: number
  room_id: number
  qr_code_data: string
  qr_image_url: string | null
  is_active: boolean
  generated_at: string
  last_scanned_at: string | null
  scan_count: number
  created_at: string
  updated_at: string
  room?: {
    id: number
    name: string
    room_number: string
  }
}

export interface CartItem {
  service_item: ServiceItem
  quantity: number
  special_notes?: string
}

export interface CreateOrderData {
  property_id: number
  room_number: string
  guest_name?: string
  phone?: string
  items: {
    service_item_id: number
    item_name: string
    item_description?: string
    quantity: number
    unit_price: number
    subtotal: number
    special_notes?: string
  }[]
  total_amount: number
  special_instructions?: string
}
