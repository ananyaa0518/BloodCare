import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { isDatabaseConnectionError } from '../utils/controllerUtils.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('[protect] token received for path:', req.path);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

            // Get user from the token but exclude password
            const userResult = await pool.query(
                'SELECT id, name, email, role, blood_type, age, last_donation_date FROM users WHERE id = $1',
                [decoded.id]
            );

            req.user = userResult.rows[0];

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('[protect]', error);
            if (isDatabaseConnectionError(error)) {
                return res.status(503).json({ message: 'Database unavailable', error: error.message });
            }
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
