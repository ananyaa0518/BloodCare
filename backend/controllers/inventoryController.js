import { pool } from '../config/db.js';

// Get all inventory details
export const getAllInventory = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory ORDER BY collection_date DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching inventory:', err);
        res.status(500).json({ message: 'Server error fetching inventory' });
    }
};

// Add new stock
export const addStock = async (req, res) => {
    try {
        const { blood_group, units, collection_date } = req.body;

        if (!blood_group || !units || !collection_date) {
            return res.status(400).json({ message: 'Missing required fields' });
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

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding stock:', err);
        res.status(500).json({ message: 'Server error adding stock' });
    }
};

// Update stock status or details
export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, units } = req.body;

        const result = await pool.query(
            `UPDATE inventory 
             SET status = COALESCE($1, status), units = COALESCE($2, units)
             WHERE id = $3 RETURNING *`,
            [status, units, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating stock:', err);
        res.status(500).json({ message: 'Server error updating stock' });
    }
};

// Delete a stock record
export const deleteStock = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM inventory WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        res.status(200).json({ message: 'Stock deleted successfully' });
    } catch (err) {
        console.error('Error deleting stock:', err);
        res.status(500).json({ message: 'Server error deleting stock' });
    }
};
