const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.sendMessage = async (req, res) => {
    const { receiverId, message } = req.body;

    try {
        const newMessage = new Message({
            sender: req.user.id,
            receiver: receiverId,
            message,
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    const { receiverId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: receiverId },
                { sender: receiverId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
