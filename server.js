const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

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
app.use('/v1/api/user',userRoutes)

// Handle Socket.io 
// io.on('connection', (socket) => {
//     console.log('New user connected');

//     socket.on('join', (roomId) => {  
//         socket.join(roomId);
//         console.log(`User joined room: ${roomId}`);
//     });

//     socket.on('message', (data) => {
//         io.to(data.roomId).emit('message', data);
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// io.on('connection', (socket) => {
//     console.log('New user connected');

//     socket.on('join', (roomId) => {
//         socket.join(roomId);
//         console.log(`User joined room: ${roomId}`);
//     });

//     socket.on('message', (data) => {
//         // Emit the message to the relevant room
//         io.to(data.roomId).emit('message', data);
//     }); 

//     socket.on('typing', ({ phone, message }) => { 
//         // Emit typing event to the room
//         io.to(phone).emit('typing', { phone, message });
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', ({ phone }) => {  // Changed to handle phone correctly
        socket.join(phone);
        console.log(`User joined room: ${phone}`);
    });

    socket.on('message', (data) => {
        const { receiverId, message } = data;
        // Emit message to the receiver's room
        io.to(receiverId).emit('message', { from: 'user', text: message });
        console.log(`Message sent to room: ${receiverId}`);
    });

    socket.on('typing', ({ phone, message }) => {
        // Broadcast the typing event to the same room
        socket.to(phone).emit('typing', { phone, message });
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
