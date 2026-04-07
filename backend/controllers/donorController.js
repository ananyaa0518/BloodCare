import { pool } from '../config/db.js';
import { sendControllerError } from '../utils/controllerUtils.js';

// @desc    Get all donors or search by blood type / city
// @route   GET /api/donors
// @access  Public
export const getDonors = async (req, res) => {
    try {
        const { blood_type, city } = req.query;
        console.log('[getDonors] query:', { blood_type, city });

        let query = 'SELECT id, name, email, role, blood_type, age, phone, city, last_donation_date, created_at FROM users WHERE role = $1';
        let params = ['Donor'];
        let paramCount = 1;

        if (blood_type) {
            paramCount++;
            query += ` AND blood_type = $${paramCount}`;
            params.push(blood_type);
        }

        if (city) {
            paramCount++;
            query += ` AND city ILIKE $${paramCount}`;
            params.push(`%${city}%`);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        console.log('[getDonors] rows:', result.rowCount);

        res.status(200).json(result.rows);
    } catch (error) {
        return sendControllerError(res, 'getDonors', error);
    }
};

// @desc    Get donor by ID
// @route   GET /api/donors/:id
// @access  Public
export const getDonorById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[getDonorById] id:', id);
        const result = await pool.query(
            'SELECT id, name, email, role, blood_type, age, phone, city, last_donation_date, created_at FROM users WHERE id = $1 AND role = $2',
            [id, 'Donor']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        return sendControllerError(res, 'getDonorById', error);
    }
};

// @desc    Update a donor
// @route   PUT /api/donors/:id
// @access  Private (Donor themselves or Admin)
export const updateDonor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, blood_type, age, phone, city, last_donation_date } = req.body;
        console.log('[updateDonor] inputs:', { id, name, blood_type, age, phone, city, last_donation_date });

        // Optionally, check if the donor exists first
        const checkResult = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [id, 'Donor']);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 blood_type = COALESCE($2, blood_type), 
                 age = COALESCE($3, age), 
                 phone = COALESCE($4, phone), 
                 city = COALESCE($5, city), 
                 last_donation_date = COALESCE($6, last_donation_date) 
             WHERE id = $7 
             RETURNING id, name, email, role, blood_type, age, phone, city, last_donation_date`,
            [name, blood_type, age, phone, city, last_donation_date, id]
        );

        res.status(200).json(result.rows[0]);
    } catch (error) {
        return sendControllerError(res, 'updateDonor', error);
    }
};

// @desc    Delete a donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin)
export const deleteDonor = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[deleteDonor] id:', id);

        const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'Donor']);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        res.status(200).json({ message: 'Donor deleted successfully' });
    } catch (error) {
        return sendControllerError(res, 'deleteDonor', error);
    }
};

// @desc    Get donation history for a donor
// @route   GET /api/donors/:id/history
// @access  Private
export const getDonationHistory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[getDonationHistory] donor id:', id);

        const result = await pool.query(
            'SELECT * FROM donation_history WHERE donor_id = $1 ORDER BY donation_date DESC',
            [id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        return sendControllerError(res, 'getDonationHistory', error);
    }
};

// @desc    Add a donation record
// @route   POST /api/donors/:id/history
// @access  Private
export const addDonationRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { donation_date, location, units, status, notes } = req.body;
        console.log('[addDonationRecord] inputs:', { id, donation_date, location, units, status });

        if (!donation_date || !units) {
            return res.status(400).json({ message: 'Date and units are required fields' });
        }

        if (Number(units) <= 0) {
            return res.status(400).json({ message: 'units must be greater than 0' });
        }

        const result = await pool.query(
            `INSERT INTO donation_history (donor_id, donation_date, location, units, status, notes) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, donation_date, location, units, status || 'Completed', notes]
        );

        // Optionally update the user's last_donation_date
        await pool.query('UPDATE users SET last_donation_date = $1 WHERE id = $2', [donation_date, id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        return sendControllerError(res, 'addDonationRecord', error);
    }
};
