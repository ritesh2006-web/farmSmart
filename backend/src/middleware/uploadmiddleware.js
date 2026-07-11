import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Store file in memory temporarily
const storage = multer.memoryStorage()
export const upload = multer({ storage })

// Call this function in your controller to upload to Cloudinary
export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'farmsmart/crop-logs' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    ).end(fileBuffer)
  })
}