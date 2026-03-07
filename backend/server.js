import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

import { pool, initDB } from './config/db.js';

app.use(cors());
app.use(express.json());

// Initialize Database
initDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
// app.use('/api/blood', bloodRoutes);
// app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
    res.send('Blood Bank API is running');
});

// Socket.io
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Example alert for emergency
    socket.on('emergency_request', (data) => {
        io.emit('emergency_alert', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
