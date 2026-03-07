import express from 'express';
import {
    getAllInventory,
    addStock,
    updateStock,
    deleteStock
} from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getAllInventory);
router.post('/', addStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);

export default router;
