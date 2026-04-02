import { pool } from '../config/db.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
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

        res.json({
            totalDonors,
            activeRequests,
            totalInventoryUnits: totalUnits,
            recentUsers: recentUsersResult.rows
        });
    } catch (error) {
        console.error('Error in getAdminStats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users for management
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const usersResult = await pool.query(`
            SELECT id, name, email, role, phone, is_active, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(usersResult.rows);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await pool.query(
            `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, is_active`,
            [is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in toggleUserStatus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
