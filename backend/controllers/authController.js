import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { sendControllerError } from '../utils/controllerUtils.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, blood_type, age, phone, city, last_donation_date } = req.body;
        console.log('[registerUser] body:', { name, email, role, blood_type, age, phone, city, last_donation_date });

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, role, blood_type, age, phone, city, last_donation_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role, blood_type, age, phone, city, last_donation_date, created_at`,
            [
                name, 
                email, 
                hashedPassword, 
                role, 
                blood_type !== undefined ? blood_type : null, 
                age !== undefined ? age : null, 
                phone !== undefined ? phone : null, 
                city !== undefined ? city : null, 
                last_donation_date !== undefined ? last_donation_date : null
            ]
        );

        if (newUser.rows[0]) {
            const createdUser = newUser.rows[0];
            console.log('[registerUser] created user id:', createdUser.id);
            res.status(201).json({
                token: generateToken(createdUser.id),
                user: {
                    id: createdUser.id,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role,
                    blood_type: createdUser.blood_type,
                    age: createdUser.age,
                    phone: createdUser.phone,
                    city: createdUser.city,
                    last_donation_date: createdUser.last_donation_date,
                    created_at: createdUser.created_at,
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        return sendControllerError(res, 'registerUser', error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[loginUser] body:', { email });

        // Check for user email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log('[loginUser] authenticated user id:', user.id);
            res.json({
                token: generateToken(user.id),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    blood_type: user.blood_type,
                    age: user.age,
                    phone: user.phone,
                    city: user.city,
                    last_donation_date: user.last_donation_date,
                    created_at: user.created_at,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        return sendControllerError(res, 'loginUser', error);
    }
};
