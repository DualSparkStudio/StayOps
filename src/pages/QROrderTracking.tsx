import { CheckCircleIcon, ClockIcon, PhoneIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { serviceOrdersApi } from '../lib/qr-service-api'
import type { OrderStatus, ServiceOrder } from '../types/qr-service'

const QROrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchOrder, 10000)
      return () => clearInterval(interval)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const data = await serviceOrdersApi.getById(parseInt(orderId!, 10))
      setOrder(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching order:', error)
      if (loading) {
        toast.error('Failed to load order')
      }
      setLoading(false)
    }
  }

  const getStatusSteps = (): { status: OrderStatus; label: string; icon: any }[] => {
    return [
      { status: 'pending', label: 'Order Placed', icon: CheckCircleIcon },
      { status: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
      { status: 'preparing', label: 'Preparing', icon: ClockIcon },
      { status: 'ready', label: 'Ready', icon: CheckCircleIcon },
      { status: 'delivered', label: 'Delivered', icon: CheckCircleIcon }
    ]
  }

  const getStatusIndex = (status: OrderStatus): number => {
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
    return statuses.indexOf(status)
  }

  const isStatusComplete = (stepStatus: OrderStatus): boolean => {
    if (!order) return false
    if (order.order_status === 'cancelled') return false
    return getStatusIndex(order.order_status) >= getStatusIndex(stepStatus)
  }

  const getStatusColor = (stepStatus: OrderStatus): string => {
    if (!order) return 'bg-gray-300'
    if (order.order_status === 'cancelled') return 'bg-red-500'
    return isStatusComplete(stepStatus) ? 'bg-green-500' : 'bg-gray-300'
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Order #{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Room</p>
              <p className="font-bold text-lg">{order.room_number}</p>
            </div>
          </div>

          {/* Current Status */}
          {order.order_status === 'cancelled' ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="font-bold text-red-900">Order Cancelled</p>
                  {order.cancellation_reason && (
                    <p className="text-sm text-red-700">Reason: {order.cancellation_reason}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="font-bold text-blue-900">
                    {order.order_status === 'delivered' ? 'Order Delivered!' : 'Order in Progress'}
                  </p>
                  <p className="text-sm text-blue-700 capitalize">
                    Current Status: {order.order_status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        {order.order_status !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Order Progress</h2>
            
            <div className="relative">
              {getStatusSteps().map((step, index) => {
                const Icon = step.icon
                const isComplete = isStatusComplete(step.status)
                const isCurrent = order.order_status === step.status

                return (
                  <div key={step.status} className="flex items-center mb-8 last:mb-0">
                    {/* Line */}
                    {index < getStatusSteps().length - 1 && (
                      <div 
                        className={`absolute left-4 w-0.5 h-8 top-8 ${
                          isComplete ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ marginTop: `${index * 64}px` }}
                      />
                    )}

                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Label */}
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-sm">(Current)</span>}
                      </p>
                      {isComplete && step.status === 'confirmed' && order.confirmed_at && (
                        <p className="text-sm text-gray-500">
                          {new Date(order.confirmed_at).toLocaleTimeString()}
                        </p>
                      )}
                      {isComplete && step.status === 'delivered' && order.completed_at && (
                        <p className="text-sm text-gray-500">
                          {new Date(order.completed_at).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">₹{item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Contact Staff */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center">
            <PhoneIcon className="h-5 w-5 mr-2" />
            Contact Staff
          </button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Status updates automatically every 10 seconds</p>
        </div>
      </div>
    </div>
  )
}

export default QROrderTracking
