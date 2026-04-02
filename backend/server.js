import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // In production, replace with frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Map to store connected users: userId -> socketId
const connectedUsers = new Map();

// Attach io and connectedUsers to req.app for access in controllers
app.set('io', io);
app.set('connectedUsers', connectedUsers);

import { pool, initDB } from './config/db.js';

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Blood Bank API is running');
});

// Socket.io
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user authenticates in the frontend, they should emit this event
    socket.on('user_connected', (userId) => {
        if (userId) {
            connectedUsers.set(userId.toString(), socket.id);
            console.log(`User ${userId} mapped to socket ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        // Remove from map on disconnect
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
