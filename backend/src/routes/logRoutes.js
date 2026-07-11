import express from 'express'
import { addLog, getLogs } from '../controllers/logController.js'
import { protect } from '../middleware/middleware.js'
import { upload } from '../middleware/uploadmiddleware.js'

const router = express.Router()

router.get('/:id/logs', protect, getLogs);
router.post('/:id/logs', protect, upload.single('photo'), addLog)

export default router;
