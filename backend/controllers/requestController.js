import { pool } from '../config/db.js';

// @desc    Create a new emergency blood request
// @route   POST /api/requests
// @access  Private (Hospital Staff only)
export const createRequest = async (req, res) => {
    try {
        const { blood_type, units_required, urgency_level, hospital_name, contact } = req.body;

        if (!blood_type || !units_required || !urgency_level || !hospital_name || !contact) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const validUrgencyLevels = ['Critical', 'High', 'Normal'];
        if (!validUrgencyLevels.includes(urgency_level)) {
            return res.status(400).json({ message: 'Invalid urgency level' });
        }

        // The protect middleware sets req.user
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO emergency_requests (blood_type, units_required, urgency_level, hospital_name, contact, user_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, blood_type, units_required, urgency_level, hospital_name, contact, status, created_at`,
            [blood_type, units_required, urgency_level, hospital_name, contact, userId]
        );

        const newRequest = result.rows[0];

        // Emit socket event to active donors matching blood type
        try {
            // Find all active donors with this blood group
            const donorsQuery = await pool.query(`SELECT id FROM users WHERE role = 'Donor' AND blood_type = $1 AND is_active = true`, [blood_type]);
            const donors = donorsQuery.rows;

            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');

            if (io && connectedUsers) {
                for (const donor of donors) {
                    const socketId = connectedUsers.get(donor.id.toString());
                    if (socketId) {
                        io.to(socketId).emit('emergency_alert', {
                            message: `Urgent! ${units_required} unit(s) of ${blood_type} needed at ${hospital_name}.`,
                            request: newRequest
                        });
                    }
                }
            }
        } catch (socketErr) {
            console.error("Error emitting socket events:", socketErr);
        }

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Server error creating request' });
    }
};

// @desc    Get all active/all emergency requests
// @route   GET /api/requests
// @access  Public or semi-public
export const getRequests = async (req, res) => {
    try {
        // We order by urgency level and then by creation date. 
        // Postgres custom ordering can be done with CASE
        const result = await pool.query(
            `SELECT * FROM emergency_requests 
             ORDER BY 
                CASE urgency_level
                     WHEN 'Critical' THEN 1
                     WHEN 'High' THEN 2
                     WHEN 'Normal' THEN 3
                END,
                created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (Hospital Staff or Admin)
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Fulfilled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE emergency_requests 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// @desc    Donor responds to an emergency request
// @route   POST /api/requests/:id/respond
// @access  Private (Donor only)
export const respondToRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const donorId = req.user.id; // user set from protect middleware

        // Optional: verify role if not done in route
        if (req.user.role !== 'Donor') {
            return res.status(403).json({ message: 'Only donors can respond' });
        }

        // Check if request exists and is still pending
        const reqCheck = await pool.query('SELECT status FROM emergency_requests WHERE id = $1', [id]);
        if (reqCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Emergency request not found' });
        }
        if (reqCheck.rows[0].status === 'Fulfilled') {
            return res.status(400).json({ message: 'This request is already fulfilled' });
        }

        // Insert response
        const responseResult = await pool.query(
            `INSERT INTO request_responses (request_id, donor_id, status)
             VALUES ($1, $2, 'Pending')
             ON CONFLICT (request_id, donor_id) DO NOTHING
             RETURNING *`,
            [id, donorId]
        );

        if (responseResult.rows.length === 0) {
            return res.status(400).json({ message: 'You have already responded to this request' });
        }

        res.status(201).json({ message: 'Response recorded successfully', response: responseResult.rows[0] });

    } catch (error) {
        console.error('Error responding to request:', error);
        res.status(500).json({ message: 'Server error handling response' });
    }
};
