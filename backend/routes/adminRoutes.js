import express from 'express';
import { getAdminStats, getAllUsers, toggleUserStatus } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to restrict access to 'Admin'
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, access restricted to Admin' });
    }
};

router.use(protect, authorizeAdmin); // Apply to all routes in this file

router.route('/stats').get(getAdminStats);
router.route('/users').get(getAllUsers);
router.route('/users/:id/status').put(toggleUserStatus);

export default router;
