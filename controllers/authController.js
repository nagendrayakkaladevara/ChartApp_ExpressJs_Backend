const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


// older register - v1
// exports.register = async (req, res) => {
//     const { phone, password } = req.body;

//     try {
//         let user = await User.findOne({ phone });
//         if (user) return res.status(400).json({ msg: 'User already exists' });

//         user = new User({ phone, password: await bcrypt.hash(password, 10) });

//         await user.save();

//         // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//         //     expiresIn: '1h',
//         // });

//         // res.json({ token, userId: user._id });
//         res.status(201).json({ msg: 'User registered successfully' });
//     } catch (err) {
//         res.status(500).json({ msg: 'Server error' });
//     }
// };

// new register includes name, date of birth - v2

exports.register = async (req, res) => {
    const { name, phone, password, dateOfBirth } = req.body;

    try {

        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ msg: 'User with this phone number already exists' });
        }

        let nameCheck = await User.findOne({ name });
        if (nameCheck) {
            return res.status(400).json({ msg: 'This username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name,
            phone,
            password: hashedPassword,
            dateOfBirth
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
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

    if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization header is missing' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [authPhone, authPassword] = credentials.split(':');

    const { phone, password } = req.body;

    if (authPhone !== phone || authPassword !== password) {
        return res.status(401).json({ msg: 'Phone number and password do not match the credentials in the Authorization header' });
    }

    try {

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ msg: 'User not registered, please register first' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials, please try again' });
        }

        res.json({ msg: 'Login successful', userId: user._id });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
