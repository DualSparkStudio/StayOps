import { MinusIcon, PlusIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { roomQRCodesApi, serviceCategoriesApi, serviceItemsApi, serviceOrdersApi } from '../lib/qr-service-api'
import type { CartItem, ServiceCategory, ServiceItem } from '../types/qr-service'

const QRServiceMenu: React.FC = () => {
  const { qrCode } = useParams<{ qrCode: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [items, setItems] = useState<ServiceItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [roomNumber, setRoomNumber] = useState('')
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [roomInfo, setRoomInfo] = useState<any>(null)

  useEffect(() => {
    if (qrCode) {
      validateAndLoadMenu()
    }
  }, [qrCode])

  const validateAndLoadMenu = async () => {
    try {
      setLoading(true)
      
      // Validate QR code
      const qrData = await roomQRCodesApi.getByQRCode(qrCode!)
      if (!qrData) {
        toast.error('Invalid QR code')
        return
      }

      // Update scan count
      await roomQRCodesApi.updateScanCount(qrCode!)
      
      // Set property context
      sessionStorage.setItem('property_id', qrData.property_id.toString())
      setRoomInfo(qrData.room)
      if (qrData.room) {
        setRoomNumber(qrData.room.room_number)
      }

      // Load menu
      const [categoriesData, itemsData] = await Promise.all([
        serviceCategoriesApi.getAll(),
        serviceItemsApi.getAll()
      ])

      setCategories(categoriesData)
      setItems(itemsData)
      
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id)
      }
    } catch (error) {
      console.error('Error loading menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: ServiceItem) => {
    const existingItem = cart.find(ci => ci.service_item.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(ci => 
        ci.service_item.id === item.id 
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      ))
    } else {
      setCart([...cart, { service_item: item, quantity: 1 }])
    }
    
    toast.success(`${item.name} added to cart`)
  }

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(cart.map(ci => {
      if (ci.service_item.id === itemId) {
        const newQuantity = ci.quantity + delta
        return newQuantity > 0 ? { ...ci, quantity: newQuantity } : ci
      }
      return ci
    }).filter(ci => ci.quantity > 0))
  }

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(ci => ci.service_item.id !== itemId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, ci) => sum + (ci.service_item.price * ci.quantity), 0)
  }

  const handlePlaceOrder = async () => {
    if (!roomNumber || !guestName) {
      toast.error('Please enter room number and name')
      return
    }

    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      const propertyId = parseInt(sessionStorage.getItem('property_id') || '1', 10)
      
      const orderData = {
        property_id: propertyId,
        room_number: roomNumber,
        guest_name: guestName,
        phone: phone || undefined,
        special_instructions: specialInstructions || undefined,
        items: cart.map(ci => ({
          service_item_id: ci.service_item.id,
          item_name: ci.service_item.name,
          item_description: ci.service_item.description || undefined,
          quantity: ci.quantity,
          unit_price: ci.service_item.price,
          subtotal: ci.service_item.price * ci.quantity,
          special_notes: ci.special_notes
        })),
        total_amount: calculateTotal()
      }

      const order = await serviceOrdersApi.create(orderData)
      toast.success('Order placed successfully!')
      navigate(`/qr-order/${order.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    }
  }

  const filteredItems = selectedCategory
    ? items.filter(item => item.category_id === selectedCategory)
    : items

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Room Service</h1>
              {roomInfo && (
                <p className="text-sm text-gray-600">Room {roomInfo.room_number} - {roomInfo.name}</p>
              )}
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">₹{item.price}</p>
                    {item.preparation_time && (
                      <p className="text-xs text-gray-500">{item.preparation_time} mins</p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(ci => (
                    <div key={ci.service_item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="font-medium">{ci.service_item.name}</p>
                        <p className="text-sm text-gray-600">₹{ci.service_item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(ci.service_item.id, -1)}
                          className="p-1 bg-gray-200 rounded"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{ci.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ci.service_item.id, 1)}
                          className="p-1 bg-gray-200 rounded"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(ci.service_item.id)}
                        className="text-red-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-6 space-y-3">
                  <input
                    type="text"
                    placeholder="Room Number *"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Guest Name *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Special instructions (optional)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QRServiceMenu
