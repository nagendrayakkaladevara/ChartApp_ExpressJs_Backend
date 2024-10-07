const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const basicAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization header missing' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [phone, password] = credentials.split(':');

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(401).json({ msg: 'User not registered, please register first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials, please try again' });

        // Attach user information to the request object
        req.user = user; // Store user info for later use in the request
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = basicAuth;
