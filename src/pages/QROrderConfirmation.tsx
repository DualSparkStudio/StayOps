import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { serviceOrdersApi } from '../lib/qr-service-api'
import type { ServiceOrder } from '../types/qr-service'

const QROrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const data = await serviceOrdersApi.getById(parseInt(orderId!, 10))
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrepTime = () => {
    if (!order?.items) return 0
    return order.items.reduce((max, item) => {
      const prepTime = item.service_item?.preparation_time || 0
      return Math.max(max, prepTime)
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been placed successfully</p>
          <div className="mt-4 inline-block bg-blue-50 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-2xl font-bold text-blue-600">#{order.id}</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Room Number</p>
              <p className="font-medium">{order.room_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Guest Name</p>
              <p className="font-medium">{order.guest_name}</p>
            </div>
            {order.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Estimated Preparation Time</p>
                <p className="text-sm text-gray-600">{getTotalPrepTime()} minutes</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.unit_price}</p>
                  </div>
                  <p className="font-bold">₹{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Special Instructions</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.special_instructions}</p>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/qr-track/${order.id}`)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Track Order Status
          </button>
          
          <button
            onClick={() => window.print()}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Print Receipt
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You will receive your order at your room. 
            You can track the status of your order in real-time.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QROrderConfirmation
