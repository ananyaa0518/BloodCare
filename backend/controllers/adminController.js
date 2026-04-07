import { pool } from '../config/db.js';
import { sendControllerError } from '../utils/controllerUtils.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        console.log('[getAdminStats] requested by user:', req.user?.id);
        // Total doners
        const donorsResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'Donor'");
        const totalDonors = parseInt(donorsResult.rows[0].count);

        // Active Emergency Requests
        const reqResult = await pool.query("SELECT COUNT(*) FROM emergency_requests WHERE status = 'Pending'");
        const activeRequests = parseInt(reqResult.rows[0].count);

        // Total Inventory Units
        const invResult = await pool.query("SELECT SUM(units) FROM inventory WHERE status = 'Available'");
        const totalUnits = parseInt(invResult.rows[0].sum || 0);

        // Recent Activity (we'll look at the last 5 users or requests as an example)
        const recentUsersResult = await pool.query("SELECT id, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5");
        console.log('[getAdminStats] rows:', {
            donors: donorsResult.rowCount,
            requests: reqResult.rowCount,
            inventory: invResult.rowCount,
            recentUsers: recentUsersResult.rowCount,
        });

        res.json({
            totalDonors,
            activeRequests,
            totalInventoryUnits: totalUnits,
            recentUsers: recentUsersResult.rows
        });
    } catch (error) {
        return sendControllerError(res, 'getAdminStats', error);
    }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        console.log('[getAllUsers] requested by user:', req.user?.id);
        const usersResult = await pool.query(`
            SELECT id, name, email, role, phone, is_active, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        console.log('[getAllUsers] returned users:', usersResult.rowCount);
        res.json(usersResult.rows);
    } catch (error) {
        return sendControllerError(res, 'getAllUsers', error);
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        console.log('[toggleUserStatus] inputs:', { id, is_active, actor: req.user?.id });

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ message: 'is_active must be a boolean' });
        }

        const result = await pool.query(
            `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active`,
            [is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('[toggleUserStatus] updated user:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        return sendControllerError(res, 'toggleUserStatus', error);
    }
};
