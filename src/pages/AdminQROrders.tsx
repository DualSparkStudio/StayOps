import { CheckCircleIcon, ClockIcon, EyeIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { usePropertyId } from '../contexts/PropertyContext'
import { serviceOrdersApi } from '../lib/qr-service-api'
import type { OrderStatus, ServiceOrder } from '../types/qr-service'

const AdminQROrders: React.FC = () => {
  const propertyId = usePropertyId()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')

  useEffect(() => {
    if (propertyId) {
      fetchOrders()
      // Set up real-time updates (optional)
      const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [filterStatus, propertyId])

  const fetchOrders = async () => {
    if (!propertyId) return
    
    try {
      setLoading(true)
      const propId = parseInt(propertyId, 10)
      const data = filterStatus === 'all' 
        ? await serviceOrdersApi.getAll(propId)
        : await serviceOrdersApi.getByStatus(filterStatus, propId)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    if (!propertyId) return
    
    try {
      await serviceOrdersApi.updateStatus(orderId, newStatus, parseInt(propertyId, 10))
      toast.success('Order status updated')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        const updated = await serviceOrdersApi.getById(orderId, parseInt(propertyId, 10))
        setSelectedOrder(updated)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt('Enter cancellation reason:')
    if (!reason || !propertyId) return

    try {
      await serviceOrdersApi.cancel(orderId, reason, parseInt(propertyId, 10))
      toast.success('Order cancelled')
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Service Orders</h1>
        <p className="text-gray-600 mt-2">Manage QR service orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as OrderStatus | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.room_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.guest_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.ordered_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">Order #{selectedOrder.id}</h2>
                <p className="text-gray-600">Room {selectedOrder.room_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Order Info */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Guest Name</p>
                <p className="font-medium">{selectedOrder.guest_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedOrder.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ordered At</p>
                <p className="font-medium">{formatDate(selectedOrder.ordered_at)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.unit_price}</p>
                      {item.special_notes && (
                        <p className="text-sm text-gray-500 italic">Note: {item.special_notes}</p>
                      )}
                    </div>
                    <p className="font-bold">₹{item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="font-bold text-lg">Total</p>
                <p className="font-bold text-lg">₹{selectedOrder.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Special Instructions</h3>
                <p className="text-gray-700 bg-yellow-50 p-3 rounded">{selectedOrder.special_instructions}</p>
              </div>
            )}

            {/* Status Update Actions */}
            {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
              <div className="flex space-x-2">
                {selectedOrder.order_status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    Confirm Order
                  </button>
                )}
                {selectedOrder.order_status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'preparing')}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    <ClockIcon className="h-5 w-5 inline mr-2" />
                    Start Preparing
                  </button>
                )}
                {selectedOrder.order_status === 'preparing' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    Mark Ready
                  </button>
                )}
                {selectedOrder.order_status === 'ready' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    Mark Delivered
                  </button>
                )}
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQROrders
