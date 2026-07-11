import dotenv from 'dotenv'
import axios from 'axios'
import NodeCache from 'node-cache'

dotenv.config()

const weatherCache = new NodeCache({ stdTTL: 60 * 30 }) // Cache for 30 minutes

export const getWeather = async (req, res) => {
    const { pincode } = req.query
    if (!pincode) {
        return res.status(400).json({ message: "Please provide a pincode!" })
    }
    const cachedWeather = weatherCache.get(pincode);
    if (cachedWeather) {
        return res.status(200).json({ data: cachedWeather, source: 'cache' })
    }
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                zip: `${pincode},IN`,
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric'
            }
        })
        weatherCache.set(pincode, response.data)
        return res.status(200).json({ data: response.data, source: 'api' })
    }
    catch (error) {
        console.error('Error fetching weather data:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}