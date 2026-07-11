import express from 'express';
import {addCrop, getCrop,deleteCrop,updateCrop} from '../controllers/cropController.js';
import { protect } from '../middleware/middleware.js';

const router = express.Router();

router.post('/add',protect,addCrop)
router.get('/get',protect,getCrop)
router.delete('/:id',protect,deleteCrop)
router.put('/:id',protect,updateCrop)

export default router
