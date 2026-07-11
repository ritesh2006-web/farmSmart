import db from '../config/db.js'

export const addCrop = async (req, res) => {
    const { cropName, soilType, area, sowingDate } = req.body
    if (!cropName || !soilType || !area || !sowingDate) {
        return res.status(400).json({ message: "Kindly provide all the details!" })
    }
    try {
        const newCrop = await db.query('INSERT INTO crops(user_id,crop_name,soil_type,area_acres,sowing_date) VALUES($1,$2,$3,$4,$5) RETURNING *', [req.user.id, cropName, soilType, area, sowingDate])
        return res.status(201).json({ message: "Crop added successfully!", crop: newCrop.rows[0] })

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}

export const getCrop = async (req, res) => {
    try {
        const crops = await db.query("SELECT * FROM crops WHERE user_id=$1", [req.user.id])
        return res.status(200).json({ crops: crops.rows })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}
export const deleteCrop = async (req, res) => {
    try {
        const cropId = req.params.id
        const deletedCrop = await db.query("DELETE FROM crops WHERE id = $1 AND user_id = $2 RETURNING *", [cropId, req.user.id])
        if (deletedCrop.rows.length === 0) {
            return res.status(404).json({ message: "Crop not found!" })
        }
        return res.status(200).json({ message: "Crop deleted successfully!", crop: deletedCrop.rows[0] })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}

export const updateCrop = async (req, res) => {
    try {
        const cropId = req.params.id
        const { cropName, soilType, area, sowingDate } = req.body

        // fetch existing crop first
        const existing = await db.query('SELECT * FROM crops WHERE id=$1 AND user_id=$2', [cropId, req.user.id])
        if (existing.rows.length === 0) return res.status(404).json({ message: 'Crop not found!' })

        // use existing values as fallback
        const updatedCrop = await db.query(
            'UPDATE crops SET crop_name=$1, soil_type=$2, area_acres=$3, sowing_date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
            [
                cropName || existing.rows[0].crop_name,
                soilType || existing.rows[0].soil_type,
                area || existing.rows[0].area_acres,
                sowingDate || existing.rows[0].sowing_date,
                cropId,
                req.user.id
            ]
        )
        return res.status(200).json({ message: "Crop updated successfully!", crop: updatedCrop.rows[0] })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message })
    }
}