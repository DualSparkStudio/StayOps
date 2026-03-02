// QR Order Notification Function
// Sends notifications when orders are placed or status changes

const nodemailer = require('nodemailer')

// Helper to get property ID from request
function getPropertyId(event) {
  const propertyId = event.headers['x-property-id'] || process.env.DEFAULT_PROPERTY_ID || '1'
  return parseInt(propertyId, 10)
}

// Create email transporter
function createTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Send order notification to staff
async function sendStaffNotification(order) {
  const transporter = createTransporter()
  
  const itemsList = order.items
    .map(item => `${item.quantity}x ${item.item_name} - ₹${item.subtotal}`)
    .join('\n')

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.STAFF_EMAIL || process.env.SMTP_USER,
    subject: `New Order #${order.id} - Room ${order.room_number}`,
    text: `
New Order Received!

Order #: ${order.id}
Room: ${order.room_number}
Guest: ${order.guest_name || 'N/A'}
Phone: ${order.phone || 'N/A'}

Items:
${itemsList}

Total: ₹${order.total_amount}

${order.special_instructions ? `Special Instructions:\n${order.special_instructions}` : ''}

Please confirm and prepare the order.
    `,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Room:</strong> ${order.room_number}</p>
      <p><strong>Guest:</strong> ${order.guest_name || 'N/A'}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
      
      <h3>Items:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.quantity}x ${item.item_name} - ₹${item.subtotal}</li>`).join('')}
      </ul>
      
      <p><strong>Total:</strong> ₹${order.total_amount}</p>
      
      ${order.special_instructions ? `<p><strong>Special Instructions:</strong><br>${order.special_instructions}</p>` : ''}
      
      <p>Please confirm and prepare the order.</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending staff notification:', error)
    return { success: false, error: error.message }
  }
}

// Send confirmation to guest
async function sendGuestConfirmation(order) {
  if (!order.phone && !order.guest_email) {
    return { success: false, error: 'No contact information' }
  }

  const transporter = createTransporter()
  
  const itemsList = order.items
    .map(item => `${item.quantity}x ${item.item_name} - ₹${item.subtotal}`)
    .join('\n')

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: order.guest_email,
    subject: `Order Confirmation #${order.id}`,
    text: `
Dear ${order.guest_name || 'Guest'},

Your order has been confirmed!

Order #: ${order.id}
Room: ${order.room_number}

Items:
${itemsList}

Total: ₹${order.total_amount}

Your order will be delivered to your room shortly.

Thank you for your order!
    `,
    html: `
      <h2>Order Confirmation</h2>
      <p>Dear ${order.guest_name || 'Guest'},</p>
      <p>Your order has been confirmed!</p>
      
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Room:</strong> ${order.room_number}</p>
      
      <h3>Items:</h3>
      <ul>
        ${order.items.map(item => `<li>${item.quantity}x ${item.item_name} - ₹${item.subtotal}</li>`).join('')}
      </ul>
      
      <p><strong>Total:</strong> ₹${order.total_amount}</p>
      
      <p>Your order will be delivered to your room shortly.</p>
      <p>Thank you for your order!</p>
    `
  }

  try {
    if (order.guest_email) {
      await transporter.sendMail(mailOptions)
    }
    return { success: true }
  } catch (error) {
    console.error('Error sending guest confirmation:', error)
    return { success: false, error: error.message }
  }
}

// Send status update notification
async function sendStatusUpdate(order, newStatus) {
  if (!order.guest_email) {
    return { success: false, error: 'No email address' }
  }

  const transporter = createTransporter()
  
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    preparing: 'Your order is now being prepared.',
    ready: 'Your order is ready and will be delivered shortly.',
    delivered: 'Your order has been delivered. Enjoy!',
    cancelled: 'Your order has been cancelled.'
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: order.guest_email,
    subject: `Order #${order.id} - Status Update`,
    text: `
Dear ${order.guest_name || 'Guest'},

${statusMessages[newStatus]}

Order #: ${order.id}
Room: ${order.room_number}
Status: ${newStatus}

Thank you!
    `,
    html: `
      <h2>Order Status Update</h2>
      <p>Dear ${order.guest_name || 'Guest'},</p>
      <p>${statusMessages[newStatus]}</p>
      
      <p><strong>Order #:</strong> ${order.id}</p>
      <p><strong>Room:</strong> ${order.room_number}</p>
      <p><strong>Status:</strong> ${newStatus}</p>
      
      <p>Thank you!</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending status update:', error)
    return { success: false, error: error.message }
  }
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-property-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { type, order, newStatus } = JSON.parse(event.body)

    let result
    switch (type) {
      case 'new_order':
        result = await sendStaffNotification(order)
        break
      case 'guest_confirmation':
        result = await sendGuestConfirmation(order)
        break
      case 'status_update':
        result = await sendStatusUpdate(order, newStatus)
        break
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid notification type' })
        }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Error in notification function:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    }
  }
}
