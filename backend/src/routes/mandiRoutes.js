import express from 'express'
import {getMandiData} from '../controllers/mandiController.js'

const router = express.Router()

router.get('/mandi',getMandiData)

export default router