import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Service for generating agricultural disease treatment recommendations using Groq API.
 * 
 * Requirement 7:
 * Groq does NOT classify the image anymore. It only provides recommendations (description,
 * medicine, dosage, prevention) based on the disease name returned by Hugging Face.
 */

/**
 * Generates treatment recommendations for a diagnosed plant disease using Groq API.
 * 
 * @param {string} diseaseName - Name of the diagnosed plant disease from Hugging Face
 * @returns {Promise<{ description: string, medicine: string, dosage: string, prevention: string }>}
 */
export const getDiseaseRecommendations = async (diseaseName) => {
    const groqKey = process.env.GROQ_API_KEY

    if (!groqKey || groqKey.trim() === '') {
        throw new Error('GROQ_API_KEY is not configured in backend/.env')
    }

    const isHealthy = diseaseName.toLowerCase().includes('healthy')

    const userPrompt = isHealthy
        ? `The crop foliage has been diagnosed as healthy: "${diseaseName}".
Provide maintenance guidelines in strict JSON format:
{
  "description": "1-2 sentence statement confirming plant foliage appears healthy and free of obvious fungal/bacterial symptoms.",
  "medicine": "None required (Plant is healthy)",
  "dosage": "N/A",
  "prevention": "Routine field sanitation, balanced fertilization, and proper watering schedule."
}`
        : `The crop disease diagnosed by an image model is: "${diseaseName}".
You must provide actionable agricultural treatment and management details for this disease.

Respond strictly in this JSON format:
{
  "description": "1-2 sentence summary of symptoms, visual cues, and impact of ${diseaseName}",
  "medicine": "Specific recommended fungicide, pesticide, or organic treatment product name suitable for ${diseaseName}",
  "dosage": "Recommended dosage per acre or application rate with water mixture instructions",
  "prevention": "Key preventive measure or cultural practice to prevent spread or future recurrence"
}`

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert plant pathologist and agricultural extension specialist. You MUST return ONLY a valid JSON object.'
                    },
                    {
                        role: 'user',
                        content: userPrompt
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
                timeout: 20000 // 20 seconds timeout
            }
        )

        const content = response.data?.choices?.[0]?.message?.content
        if (!content) {
            throw new Error('Empty response received from Groq API.')
        }

        const parsed = JSON.parse(content)

        return {
            description: parsed.description || `Symptoms identified for ${diseaseName}.`,
            medicine: parsed.medicine || 'Consult local agricultural expert for target fungicide.',
            dosage: parsed.dosage || 'Follow package instructions carefully.',
            prevention: parsed.prevention || 'Ensure crop rotation and balanced soil nutrients.'
        }

    } catch (error) {
        console.error('Groq Recommendation Service Error:', error.response?.data || error.message)
        throw new Error('Failed to generate treatment recommendations: ' + (error.response?.data?.error?.message || error.message))
    }
}
