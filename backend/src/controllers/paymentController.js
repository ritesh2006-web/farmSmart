import Razorpay from 'razorpay'
import crypto from 'crypto'
import db from '../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Razorpay with test credentials from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

/**
 * createOrder
 * -----------
 * Called BEFORE registration.
 * Creates a Razorpay order of ₹299 and returns the order_id to frontend.
 * Frontend uses this order_id to open the Razorpay payment popup.
 *
 * Route: POST /api/payment/create-order
 * Auth: No (public route)
 */
export const createOrder = async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 29900,          // amount in paise (₹299 = 29900 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,   // unique receipt id
    })

    return res.status(201).json({
      success: true,
      order_id: order.id,       // frontend needs this to open popup
      amount: order.amount,
      currency: order.currency
    })
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    return res.status(500).json({ message: 'Failed to create payment order' })
  }
}

/**
 * verifyPayment
 * -------------
 * Called AFTER Razorpay popup closes successfully.
 * 
 * How Razorpay signature verification works:
 * - Razorpay sends back: order_id, payment_id, signature
 * - We recreate the signature on our server using HMAC SHA256
 * - If our signature matches Razorpay's → payment is genuine
 * - If not → payment was tampered with → reject it
 *
 * Route: POST /api/payment/verify
 * Auth: No (public route)
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId }
 */
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
    return res.status(400).json({ message: 'Missing payment details' })
  }

  try {
    // Step 1: Recreate the signature string
    // Format is always: order_id|payment_id
    const body = razorpay_order_id + '|' + razorpay_payment_id

    // Step 2: Hash it using your Razorpay key_secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    // Step 3: Compare with the signature Razorpay sent
    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      // Signatures don't match → payment is fake or tampered
      return res.status(400).json({ message: 'Payment verification failed' })
    }

    // Step 4: Payment is genuine → update user is_paid to true in DB
    await db.query(
      'UPDATE users SET is_paid = TRUE WHERE id = $1',
      [userId]
    )

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return res.status(500).json({ message: 'Server error during verification' })
  }
}