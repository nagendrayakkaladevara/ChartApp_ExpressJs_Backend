require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 4000;

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

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

// Routes - (version on routes)
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/messages', messageRoutes);
app.use('/v1/api/user', userRoutes)

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

    socket.on('join', ({ phone }) => { 
        socket.join(phone);
        console.log(`User joined room: ${phone}`);
    });

    socket.on('typing', ({ roomId, message }) => {
        console.log(`typing ${message} - roomId ${roomId}`);
        socket.to(roomId).emit('typing', { userId: socket.id, message });
    });

    socket.on('sendMessage', ({ roomId, message }) => {
        console.log(`Message sent - roomId ${roomId}`);
        socket.to(roomId).emit('receiveMessage', { userId: socket.id, message });
    });

    socket.on('viewChat', ({ roomId, message }) => {
        console.log(`User viewing you chat ${roomId}`);
        socket.to(roomId).emit('viewChat', { userId: socket.id, message });
    });

    socket.on('offline', ({ roomId, message }) => {
        console.log(`User viewing you chat ${roomId}`);
        socket.to(roomId).emit('offline', { userId: socket.id, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
