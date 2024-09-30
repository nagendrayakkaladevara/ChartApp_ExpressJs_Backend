const Message = require('../models/messageModel');

// Send a message
exports.sendMessage = async (req, res) => {
    const { receiverId, message } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user._id, // Use the authenticated user's ID
            receiver: receiverId,
            message,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

// Get messages between users
exports.getMessages = async (req, res) => {
    const { receiverId } = req.params;

    console.log('Sender ID:', req.user._id);
    console.log('Receiver ID:', receiverId);

    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id }
            ]
        }).sort({ createdAt: 1 });

        console.log('Fetched messages:', messages); // Log the messages
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err); // Log the error
        res.status(500).json({ msg: 'Server error' });
    }
};

