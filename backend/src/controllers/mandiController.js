import NodeCache from 'node-cache'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const cache = new NodeCache({ stdTTL: 60 * 60 * 6 }) // 6 hours

export const getMandiData = async (req, res) => {
    const { crop, state } = req.query;
    if (!crop || !state) {
        return res.status(400).json({ message: "Please provide both crop and state parameters!" })
    }
    const cacheKey = `${crop}_${state}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return res.status(200).json({ data: cachedData, source: 'cache' })
    }
    try {
        const response = await axios.get('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', {
            params: {
                'api-key': process.env.DATA_GOV_API_KEY,
                format: 'json',
                'filters[commodity]': crop,
                'filters[state]': state,
                limit: 10
            }
        })
        cache.set(cacheKey, response.data.records)
        return res.status(200).json({ data: response.data.records, source: 'api' })
    } catch (error) {
        console.error('Error fetching mandi data:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
