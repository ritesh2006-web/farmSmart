import axios from 'axios'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Service for Plant Disease Classification using Hugging Face Inference API
 * 
 * Recommended Model: `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`
 * Why chosen:
 * 1. Trained on the benchmark PlantVillage dataset covering 38 disease/healthy categories across 14 crop species.
 * 2. High classification accuracy on plant foliage pathologies.
 * 3. Fully supported on Hugging Face Serverless Inference API router (`router.huggingface.co`), providing fast binary response times.
 */
const DEFAULT_MODEL = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification'

/**
 * Extracts crop family category from a model label.
 * Helps aggregate sub-disease probabilities for the same crop family.
 * 
 * @param {string} label 
 * @returns {string}
 */
const extractCropFamily = (label = '') => {
    const l = label.toLowerCase()
    if (l.includes('corn') || l.includes('maize')) return 'Corn (Maize)'
    if (l.includes('tomato')) return 'Tomato'
    if (l.includes('potato')) return 'Potato'
    if (l.includes('bell pepper') || l.includes('pepper')) return 'Bell Pepper'
    if (l.includes('apple')) return 'Apple'
    if (l.includes('grape')) return 'Grape'
    if (l.includes('strawberry')) return 'Strawberry'
    if (l.includes('cherry')) return 'Cherry'
    if (l.includes('peach')) return 'Peach'
    if (l.includes('orange') || l.includes('citrus')) return 'Orange'
    if (l.includes('squash')) return 'Squash'
    if (l.includes('soybean')) return 'Soybean'
    if (l.includes('raspberry')) return 'Raspberry'
    if (l.includes('blueberry')) return 'Blueberry'
    return label.split('___')[0].split(' ')[0] || 'Plant'
}

/**
 * Formats raw Hugging Face class label into clean human-readable disease name.
 * e.g., "Tomato___Bacterial_spot" -> "Tomato - Bacterial Spot"
 *       "Corn (Maize) with Common Rust" -> "Corn (Maize) - Common Rust"
 *       "Tomato___healthy" -> "Tomato (Healthy)"
 * @param {string} rawLabel 
 * @returns {string}
 */
const formatDiseaseName = (rawLabel) => {
    if (!rawLabel) return 'Unknown Plant Disease'

    // Handle labels separated by '___'
    if (rawLabel.includes('___')) {
        const parts = rawLabel.split('___')
        const crop = parts[0].replace(/_/g, ' ').trim()
        const disease = parts[1].replace(/_/g, ' ').trim()
        
        if (disease.toLowerCase() === 'healthy') {
            return `${crop} (Healthy)`
        }
        return `${crop} - ${disease}`
    }

    // Handle labels with 'with' (e.g., "Corn (Maize) with Common Rust")
    if (rawLabel.toLowerCase().includes(' with ')) {
        const parts = rawLabel.split(/ with /i)
        const crop = parts[0].trim()
        const disease = parts[1].trim()
        return `${crop} - ${disease}`
    }

    return rawLabel.replace(/_/g, ' ').trim()
}

/**
 * Classifies a plant leaf image using Hugging Face Inference API.
 * 
 * Includes Crop-Family Aggregation to solve multi-sub-disease probability splits 
 * and eliminate false "Bell Pepper" / false "Detection Failed" errors.
 * 
 * @param {string} filePath - Path to the local uploaded image file
 * @returns {Promise<{ isConfident: boolean, diseaseName?: string, confidence?: string, rawLabel?: string, score?: number, error?: string }>}
 */
export const classifyPlantImage = async (filePath) => {
    const hfApiKey = process.env.HF_API_KEY
    const model = process.env.HF_MODEL || DEFAULT_MODEL

    if (!hfApiKey || hfApiKey.trim() === '') {
        console.warn('HF_API_KEY is missing in backend/.env')
        throw new Error('HF_API_KEY is not configured in environment variables.')
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(`Uploaded file not found at path: ${filePath}`)
    }

    // Requirement 3 & 4: Read uploaded image using fs.readFileSync and send binary buffer
    const imageBuffer = fs.readFileSync(filePath)

    // Supported endpoints: HF Router Endpoint (recommended) with legacy fallback
    const apiUrls = [
        `https://router.huggingface.co/hf-inference/models/${model}`,
        `https://api-inference.huggingface.co/models/${model}`
    ]

    let response = null
    let lastError = null

    for (const url of apiUrls) {
        try {
            response = await axios.post(url, imageBuffer, {
                headers: {
                    'Authorization': `Bearer ${hfApiKey}`,
                    'Content-Type': 'application/octet-stream'
                },
                timeout: 30000 // 30s timeout
            })
            if (response && response.data) break
        } catch (err) {
            lastError = err
            if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') continue
            if (err.response) break
        }
    }

    if (!response || !response.data) {
        const errorMsg = lastError?.response?.data?.error || lastError?.message || 'Failed to connect to Hugging Face API'
        console.error('Hugging Face Inference API Error:', errorMsg)

        if (lastError?.response?.status === 400) {
            return { isConfident: false, error: 'Invalid or unreadable image' }
        }

        throw new Error(`Hugging Face API Error: ${errorMsg}`)
    }

    const predictions = response.data

    // Validate response structure (HF returns array of { label, score } objects)
    if (!Array.isArray(predictions) || predictions.length === 0) {
        console.error('Unexpected HF API response:', predictions)
        return { isConfident: false, error: 'Invalid model output structure' }
    }

    // Requirement 5: Receive prediction and confidence score
    // Apply Smart Crop-Family Aggregation to prevent fine-grained probability splits from failing valid leaf images
    const familyScores = {}
    predictions.forEach(p => {
        const crop = extractCropFamily(p.label)
        familyScores[crop] = (familyScores[crop] || 0) + (p.score || 0)
    })

    const sortedFamilies = Object.entries(familyScores).sort((a, b) => b[1] - a[1])
    const dominantFamily = sortedFamilies[0][0]
    const dominantFamilyScore = sortedFamilies[0][1]

    // Find highest scoring specific disease prediction within the dominant crop family
    const topPredictionInFamily = predictions.find(p => extractCropFamily(p.label) === dominantFamily) || predictions[0]
    
    const topSingleScore = predictions[0].score || 0
    const rawLabel = topPredictionInFamily.label || predictions[0].label || ''

    // Requirement 13: Confidence threshold check
    // We accept if combined crop family score is >= 0.40 OR top single score >= 0.35
    if (dominantFamilyScore < 0.40 && topSingleScore < 0.35) {
        return {
            isConfident: false,
            score: topSingleScore,
            rawLabel
        }
    }

    const formattedName = formatDiseaseName(rawLabel)

    // Calculate effective confidence score
    const effectiveScore = Math.max(dominantFamilyScore, topSingleScore)
    const confidencePercentage = `${Math.round(effectiveScore * 100)}%`

    return {
        isConfident: true,
        diseaseName: formattedName,
        rawLabel,
        confidence: confidencePercentage,
        score: effectiveScore
    }
}
