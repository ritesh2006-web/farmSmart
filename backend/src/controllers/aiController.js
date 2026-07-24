import fs from 'fs'
import { classifyPlantImage } from '../services/diseaseService.js'
import { getDiseaseRecommendations } from '../services/recommendationService.js'
import { predictYield as executePredictYield } from './geminiController.js'

/**
 * Controller for AI Operations:
 * 1. Disease Detection (Hugging Face Image Classification + Groq Recommendations)
 * 2. Crop Yield Prediction
 */

/**
 * Detect plant disease from an uploaded leaf image.
 * 
 * Workflow:
 * 1. Validate uploaded file.
 * 2. Send binary image buffer to Hugging Face Inference API via diseaseService.
 * 3. Check model confidence (if < 50%, return low-confidence response).
 * 4. Pass detected disease name to Groq via recommendationService for agricultural guidance.
 * 5. Return structured JSON response.
 * 6. Always clean up (delete) the uploaded file in a `finally` block.
 */
export const detectDisease = async (req, res) => {
    // 1. Validate file upload
    if (!req.file || !req.file.path) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a leaf image.'
        })
    }

    const filePath = req.file.path

    try {
        // 2. Perform Hugging Face image classification
        const classification = await classifyPlantImage(filePath)

        // Requirement 13: If image is blurry, invalid, or confidence < 50%
        if (!classification.isConfident) {
            return res.status(200).json({
                success: false,
                message: 'Unable to confidently identify the disease. Please upload a clearer leaf image.'
            })
        }

        const { diseaseName, confidence } = classification

        // 3. Fetch agricultural treatment recommendations from Groq
        const recommendations = await getDiseaseRecommendations(diseaseName)

        // 4. Requirement 6: Return exact JSON structure
        return res.status(200).json({
            success: true,
            detection: {
                diseaseName,
                confidence,
                description: recommendations.description,
                medicine: recommendations.medicine,
                dosage: recommendations.dosage,
                prevention: recommendations.prevention
            }
        })

    } catch (error) {
        console.error('Disease Detection Controller Error:', error.message)

        // If error message indicates low confidence or bad image from service
        if (error.message && error.message.includes('blurry')) {
            return res.status(200).json({
                success: false,
                message: 'Unable to confidently identify the disease. Please upload a clearer leaf image.'
            })
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during disease detection.'
        })

    } finally {
        // Requirement 8: Delete uploaded image after processing
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath)
            } catch (unlinkErr) {
                console.error(`Failed to delete temporary file ${filePath}:`, unlinkErr.message)
            }
        }
    }
}

/**
 * Predict crop yield based on crop, soil type, and fertilizer input.
 * Delegates to existing yield prediction logic.
 */
export const predictYield = executePredictYield
