import {getWeather} from '../controllers/weatherController.js'
import express from 'express'

const router = express.Router()

router.get('/weather',getWeather)

export default router