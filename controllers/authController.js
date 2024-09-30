const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
    const { phone, password } = req.body;

    try {
        let user = await User.findOne({ phone });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ phone, password: await bcrypt.hash(password, 10) });

        await user.save();

        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        //     expiresIn: '1h',
        // });

        // res.json({ token, userId: user._id });
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};


// JWT login
// exports.login = async (req, res) => {
//     const { phone, password } = req.body;

//     try {
//         const user = await User.findOne({ phone });
//         if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//             expiresIn: '1h',
//         });

//         res.json({ token, userId: user._id });
//     } catch (err) {
//         res.status(500).json({ msg: 'Server error' });
//     }
// };

// Basic auth login
exports.login = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [phone, password] = credentials.split(':');

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // On successful login, you can return user details or a custom message
        res.json({ msg: 'Login successful', userId: user._id });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};