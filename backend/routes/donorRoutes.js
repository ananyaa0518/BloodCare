import express from 'express';
import { getDonors, getDonorById, updateDonor, deleteDonor, getDonationHistory, addDonationRecord } from '../controllers/donorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDonors);
router.get('/:id', getDonorById);
router.put('/:id', protect, updateDonor);
router.delete('/:id', protect, deleteDonor);
router.get('/:id/history', protect, getDonationHistory);
router.post('/:id/history', protect, addDonationRecord);

export default router;
