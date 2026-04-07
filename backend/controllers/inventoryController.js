import { pool } from '../config/db.js';
import { sendControllerError } from '../utils/controllerUtils.js';

// Get all inventory details
export const getAllInventory = async (req, res) => {
    try {
        console.log('[getAllInventory] request received');
        const result = await pool.query('SELECT * FROM inventory ORDER BY collection_date DESC');
        console.log('[getAllInventory] returned rows:', result.rowCount);
        res.status(200).json(result.rows);
    } catch (err) {
        return sendControllerError(res, 'getAllInventory', err);
    }
};

// Add new stock
export const addStock = async (req, res) => {
    try {
        const { blood_group, units, collection_date } = req.body;
        console.log('[addStock] body:', { blood_group, units, collection_date });

        if (!blood_group || !units || !collection_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (Number(units) <= 0) {
            return res.status(400).json({ message: 'units must be greater than 0' });
        }

        // Calculate expiry date: 42 days from collection date
        const collectionDateObj = new Date(collection_date);
        const expiryDateObj = new Date(collectionDateObj);
        expiryDateObj.setDate(expiryDateObj.getDate() + 42);

        const result = await pool.query(
            `INSERT INTO inventory (blood_group, units, collection_date, expiry_date)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [blood_group, units, collection_date, expiryDateObj.toISOString().split('T')[0]]
        );

        console.log('[addStock] inserted id:', result.rows[0]?.id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        return sendControllerError(res, 'addStock', err);
    }
};

// Update stock status or details
export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, units } = req.body;
        console.log('[updateStock] inputs:', { id, status, units });

        if (units !== undefined && Number(units) <= 0) {
            return res.status(400).json({ message: 'units must be greater than 0' });
        }

        const result = await pool.query(
            `UPDATE inventory 
             SET status = COALESCE($1, status), units = COALESCE($2, units)
             WHERE id = $3 RETURNING *`,
            [status, units, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        console.log('[updateStock] updated id:', result.rows[0]?.id);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        return sendControllerError(res, 'updateStock', err);
    }
};

// Delete a stock record
export const deleteStock = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[deleteStock] id:', id);

        const result = await pool.query(
            'DELETE FROM inventory WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        return sendControllerError(res, 'deleteStock', err);
    }
};
