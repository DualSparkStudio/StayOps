// QR Code Generator Utility for Phase 2

import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Generate unique QR code data for a room
 */
export function generateQRCodeData(propertyId: number, roomId: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `GVR-${propertyId}-${roomId}-${timestamp}-${random}`
}

/**
 * Generate QR code as Data URL (for display in browser)
 */
export async function generateQRCodeDataURL(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    return await QRCode.toDataURL(data, defaultOptions)
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as Canvas element
 */
export async function generateQRCodeCanvas(
  data: string,
  canvas: HTMLCanvasElement,
  options: QRCodeOptions = {}
): Promise<void> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    await QRCode.toCanvas(canvas, data, defaultOptions)
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    return await QRCode.toString(data, { ...defaultOptions, type: 'svg' })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Download QR code as PNG
 */
export function downloadQRCode(dataURL: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataURL
  link.download = `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Validate QR code format
 */
export function validateQRCodeData(data: string): boolean {
  // Format: GVR-{propertyId}-{roomId}-{timestamp}-{random}
  const pattern = /^GVR-\d+-\d+-\d+-[a-z0-9]+$/
  return pattern.test(data)
}

/**
 * Extract property and room ID from QR code data
 */
export function parseQRCodeData(data: string): { propertyId: number; roomId: number } | null {
  if (!validateQRCodeData(data)) {
    return null
  }

  const parts = data.split('-')
  return {
    propertyId: parseInt(parts[1], 10),
    roomId: parseInt(parts[2], 10)
  }
}
