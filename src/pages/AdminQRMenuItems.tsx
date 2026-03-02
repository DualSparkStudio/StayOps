import { PencilIcon, PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { usePropertyId } from '../contexts/PropertyContext'
import { serviceCategoriesApi, serviceItemsApi } from '../lib/qr-service-api'
import type { ServiceCategory, ServiceItem } from '../types/qr-service'

const AdminQRMenuItems: React.FC = () => {
  const propertyId = usePropertyId()
  const [items, setItems] = useState<ServiceItem[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: 0,
    price: 0,
    image_url: '',
    is_available: true,
    preparation_time: 0,
    display_order: 0,
    tags: [] as string[]
  })

  useEffect(() => {
    if (propertyId) {
      fetchData()
    }
  }, [propertyId])

  const fetchData = async () => {
    if (!propertyId) return
    
    try {
      setLoading(true)
      const propId = parseInt(propertyId, 10)
      const [itemsData, categoriesData] = await Promise.all([
        serviceItemsApi.getAllAdmin(propId),
        serviceCategoriesApi.getAllAdmin(propId)
      ])
      setItems(itemsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category_id) {
      toast.error('Please fill in required fields')
      return
    }

    if (!propertyId) return

    try {
      const propId = parseInt(propertyId, 10)
      if (editingItem) {
        await serviceItemsApi.update(editingItem.id, formData, propId)
        toast.success('Item updated successfully')
      } else {
        await serviceItemsApi.create(formData, propId)
        toast.success('Item created successfully')
      }

      setIsModalOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    }
  }

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      category_id: item.category_id || 0,
      price: item.price,
      image_url: item.image_url || '',
      is_available: item.is_available,
      preparation_time: item.preparation_time || 0,
      display_order: item.display_order,
      tags: item.tags || []
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    if (!propertyId) return

    try {
      await serviceItemsApi.delete(id, parseInt(propertyId, 10))
      toast.success('Item deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_id: 0,
      price: 0,
      image_url: '',
      is_available: true,
      preparation_time: 0,
      display_order: 0,
      tags: []
    })
    setEditingItem(null)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category_id === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-gray-600 mt-2">Manage your QR service menu items</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <PhotoIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.is_available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                {item.preparation_time && (
                  <span className="text-sm text-gray-500">{item.preparation_time} min</span>
                )}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 text-blue-600 hover:text-blue-900 py-2 border border-blue-600 rounded"
                >
                  <PencilIcon className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 text-red-600 hover:text-red-900 py-2 border border-red-600 rounded"
                >
                  <TrashIcon className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found. Add your first menu item to get started.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      required
                    >
                      <option value={0}>Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="vegetarian, spicy, popular"
                    />
                  </div>

                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                      Available for ordering
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQRMenuItems
