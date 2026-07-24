import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// ─── Yield Prediction ───────────────────────────────────────────
export const predictYield = async (req, res) => {
    const { crop, soilType, fertilizer } = req.body

    if (!crop || !soilType || !fertilizer) {
        return res.status(400).json({ message: 'Please provide crop, soilType, and fertilizer.' })
    }

    const groqKey = process.env.GROQ_API_KEY

    try {
        if (!groqKey || groqKey.trim() === '') {
            return res.status(500).json({ message: 'GROQ_API_KEY is not configured in backend/.env' })
        }

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an agricultural AI expert. You MUST return a JSON object with crop yield predictions.'
                    },
                    {
                        role: 'user',
                        content: `Predict crop yield for:
Crop: ${crop}
Soil Type: ${soilType}
Fertilizer Used: ${fertilizer} kg/acre

Respond strictly in this JSON structure:
{
  "yieldPercentage": "<number 0-100 representing yield efficiency relative to maximum potential>",
  "yieldValue": "<estimated yield quintals per acre as a number>",
  "unit": "qtl/acre",
  "confidence": "<confidence score 75-95 as a number>",
  "summary": "<1-2 sentence agricultural insight for this combination>"
}`
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${groqKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        )

        const parsed = JSON.parse(response.data.choices[0].message.content)

        return res.status(200).json({
            success: true,
            prediction: {
                yieldPercentage: String(parsed.yieldPercentage || '85'),
                yieldValue: String(parsed.yieldValue || '42.5'),
                unit: parsed.unit || 'qtl/acre',
                confidence: String(parsed.confidence || '92'),
                summary: parsed.summary || 'Good expected yield for given parameters.'
            }
        })

    } catch (error) {
        console.error('Groq Yield Prediction Error:', error.response?.data || error.message)
        return res.status(500).json({
            message: 'AI API Error: ' + (error.response?.data?.error?.message || error.message)
        })
    }
}


// ─── Disease Detection (Delegated to aiController.js) ─────────────
export const detectDisease = async (req, res) => {
    const { detectDisease: newDetectDisease } = await import('./aiController.js')
    return newDetectDisease(req, res)
}
