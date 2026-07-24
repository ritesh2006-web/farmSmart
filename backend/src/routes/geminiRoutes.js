import express from 'express'
import multer from 'multer'
import path from 'path'
import { predictYield, detectDisease } from '../controllers/aiController.js'
import { protect } from '../middleware/middleware.js'

const router = express.Router()

// ─── Multer Configuration ───────────────────────────────────────
// Stores uploaded leaf images temporarily in an 'uploads/' folder
// so we can read them as base64 before sending to Gemini Vision.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'leaf-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false)
        }
    }
})

// ─── Routes ─────────────────────────────────────────────────────
// POST /api/gemini/predict-yield  → Yield prediction via text prompt
// POST /api/gemini/detect-disease → Disease detection via image upload
router.post('/predict-yield', protect, predictYield)
router.post('/detect-disease', protect, upload.single('leafImage'), detectDisease)

export default router
