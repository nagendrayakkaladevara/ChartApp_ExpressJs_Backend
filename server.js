const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB();
 
// Middleware
app.use(cors());
app.use(express.json());

// Routes - (version on routes)
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/messages', messageRoutes);

// Handle Socket.io
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('message', (data) => {
        io.to(data.roomId).emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
