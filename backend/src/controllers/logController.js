import db from '../config/db.js'
import { uploadToCloudinary } from '../middleware/uploadmiddleware.js'
import dotenv from 'dotenv'

dotenv.config()

export const addLog = async (req, res) => {
    try {
        const cropId = req.params.id;
        const { healthScore, notes, date } = req.body;

        // Upload to Cloudinary if photo exists
        let photoUrl = null
        if (req.file) {
            photoUrl = await uploadToCloudinary(req.file.buffer)
        }

        const cropFound = await db.query('SELECT * FROM crops WHERE id=$1 AND user_id=$2', [cropId, req.user.id]);
        if (cropFound.rows.length === 0) {
            return res.status(404).json({ message: "Crop not found!" })
        }

        const newLog = await db.query(
            'INSERT INTO crop_logs(crop_id, health_score, notes, date, photo_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [cropId, healthScore, notes, date || new Date(), photoUrl]
        )

        return res.status(201).json({ message: "Log added successfully!", log: newLog.rows[0] })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}

export const getLogs = async (req, res) => {
    try {
        const cropId = req.params.id;
        const cropFound = await db.query('SELECT * FROM crops WHERE id=$1 AND user_id=$2', [cropId, req.user.id]);
        if (cropFound.rows.length === 0) {
            return res.status(404).json({ message: "Crop not found!" })
        }
        const logs = await db.query('SELECT * FROM crop_logs WHERE crop_id=$1 ORDER BY date DESC', [cropId]);
        return res.status(200).json({ logs: logs.rows })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}