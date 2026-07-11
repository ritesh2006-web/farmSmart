import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './src/routes/authRoutes.js'
import cropRoutes from './src/routes/cropRoutes.js'
import logRoutes from './src/routes/logRoutes.js'
import mandiRoutes from './src/routes/mandiRoutes.js'
import weatherRoutes from './src/routes/weatherRoute.js'
import paymentRoutes from './src/routes/paymentRoutes.js'


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3000

app.use('/api/auth', authRoutes)
app.use('/api/crops', cropRoutes)
app.use('/api/crops', logRoutes)
app.use('/api/data', mandiRoutes)
app.use('/api', weatherRoutes)
app.use('/api/payment', paymentRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
