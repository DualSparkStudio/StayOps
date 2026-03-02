import { ArrowDownTrayIcon, ArrowPathIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { usePropertyId } from '../contexts/PropertyContext'
import { roomQRCodesApi } from '../lib/qr-service-api'
import { downloadQRCode, generateQRCodeData, generateQRCodeDataURL } from '../lib/qr-code-generator'
import { supabase } from '../lib/supabase'
import type { RoomQRCode } from '../types/qr-service'

interface Room {
  id: number
  name: string
  room_number: string
}

const AdminRoomQRCodes: React.FC = () => {
  const propertyId = usePropertyId()
  const [rooms, setRooms] = useState<Room[]>([])
  const [qrCodes, setQRCodes] = useState<RoomQRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedQR, setSelectedQR] = useState<{ room: Room; qrCode: RoomQRCode; imageUrl: string } | null>(null)

  useEffect(() => {
    if (propertyId) {
      fetchData()
    }
  }, [propertyId])

  const fetchData = async () => {
    if (!propertyId) return
    
    try {
      setLoading(true)
      
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, room_number')
        .eq('property_id', propertyId)
        .order('room_number')

      if (roomsError) throw roomsError
      setRooms(roomsData || [])

      // Fetch QR codes
      const qrData = await roomQRCodesApi.getAll(parseInt(propertyId, 10))
      setQRCodes(qrData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const generateQRForRoom = async (room: Room) => {
    if (!propertyId) return
    
    try {
      const propId = parseInt(propertyId, 10)
      const qrData = generateQRCodeData(propId, room.id)
      
      // Use production URL from env or fallback to current origin
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const qrUrl = `${baseUrl}/qr/${qrData}`
      const imageUrl = await generateQRCodeDataURL(qrUrl)

      await roomQRCodesApi.create(room.id, qrData, propId)
      toast.success(`QR code generated for ${room.name}`)
      fetchData()
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    }
  }

  const generateAllQRCodes = async () => {
    if (!confirm('Generate QR codes for all rooms without codes?')) return
    if (!propertyId) return

    setGenerating(true)
    try {
      const roomsWithoutQR = rooms.filter(
        room => !qrCodes.find(qr => qr.room_id === room.id)
      )

      for (const room of roomsWithoutQR) {
        await generateQRForRoom(room)
      }

      toast.success(`Generated ${roomsWithoutQR.length} QR codes`)
    } catch (error) {
      console.error('Error generating QR codes:', error)
      toast.error('Failed to generate all QR codes')
    } finally {
      setGenerating(false)
    }
  }

  const regenerateQRCode = async (room: Room) => {
    if (!confirm(`Regenerate QR code for ${room.name}? The old code will be deactivated.`)) return
    if (!propertyId) return

    try {
      const propId = parseInt(propertyId, 10)
      const newQRData = generateQRCodeData(propId, room.id)
      
      await roomQRCodesApi.regenerate(room.id, newQRData, propId)
      toast.success('QR code regenerated')
      fetchData()
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast.error('Failed to regenerate QR code')
    }
  }

  const viewQRCode = async (room: Room, qrCode: RoomQRCode) => {
    try {
      // Use production URL from env or fallback to current origin
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const qrUrl = `${baseUrl}/qr/${qrCode.qr_code_data}`
      const imageUrl = await generateQRCodeDataURL(qrUrl, { width: 400 })
      setSelectedQR({ room, qrCode, imageUrl })
    } catch (error) {
      console.error('Error viewing QR code:', error)
      toast.error('Failed to load QR code')
    }
  }

  const handleDownload = (room: Room, imageUrl: string) => {
    downloadQRCode(imageUrl, `qr-${room.room_number}-${room.name}`)
    toast.success('QR code downloaded')
  }

  const getRoomQRCode = (roomId: number) => {
    return qrCodes.find(qr => qr.room_id === roomId)
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room QR Codes</h1>
          <p className="text-gray-600 mt-2">Generate and manage QR codes for rooms</p>
        </div>
        <button
          onClick={generateAllQRCodes}
          disabled={generating}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <QrCodeIcon className="h-5 w-5 mr-2" />
          {generating ? 'Generating...' : 'Generate All'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scanned</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => {
                const qrCode = getRoomQRCode(room.id)
                return (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.room_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {qrCode ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Generated
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {qrCode?.scan_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {qrCode?.last_scanned_at 
                        ? new Date(qrCode.last_scanned_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {qrCode ? (
                        <>
                          <button
                            onClick={() => viewQRCode(room, qrCode)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <QrCodeIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => regenerateQRCode(room)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <ArrowPathIcon className="h-5 w-5 inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => generateQRForRoom(room)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Generate
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Preview Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedQR.room.name} - Room {selectedQR.room.room_number}
            </h2>
            
            <div className="flex justify-center mb-4">
              <img 
                src={selectedQR.imageUrl} 
                alt="QR Code" 
                className="border-4 border-gray-200 rounded-lg"
              />
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p>Scans: {selectedQR.qrCode.scan_count}</p>
              <p>Generated: {new Date(selectedQR.qrCode.generated_at).toLocaleDateString()}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleDownload(selectedQR.room, selectedQR.imageUrl)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRoomQRCodes
