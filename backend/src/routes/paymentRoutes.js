import express from 'express'
import { createOrder, verifyPayment } from '../controllers/paymentController.js'

const router = express.Router()

// Public routes — no JWT needed
router.post('/create-order', createOrder)
router.post('/verify', verifyPayment)

export default router