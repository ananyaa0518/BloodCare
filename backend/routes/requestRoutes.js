import express from 'express';
import { createRequest, getRequests, updateRequestStatus, respondToRequest } from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to 'Hospital Staff'
const authorizeHospitalStaff = (req, res, next) => {
    if (req.user && (req.user.role === 'Hospital Staff' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, access restricted to Hospital Staff' });
    }
};

// Public route to get all requests
router.route('/')
    .get(getRequests)
    .post(protect, authorizeHospitalStaff, createRequest);

router.route('/:id/status')
    .put(protect, authorizeHospitalStaff, updateRequestStatus);

router.route('/:id/respond')
    .post(protect, respondToRequest);

export default router;
