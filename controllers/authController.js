const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { z } = require('zod');


const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(40, 'First name is too long'),
    secondName: z.string().max(40, 'Second name is too long').optional(),
    lastName: z.string().min(1, 'Last name is required').max(40, 'Last name is too long'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number is too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
});


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

// exports.register = async (req, res) => {
//     const { name, phone, password, dateOfBirth } = req.body;

//     try {

//         let user = await User.findOne({ phone });
//         if (user) {
//             return res.status(400).json({ msg: 'User with this phone number already exists' });
//         }

//         let nameCheck = await User.findOne({ name });
//         if (nameCheck) {
//             return res.status(400).json({ msg: 'This username is already taken' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         user = new User({
//             name,
//             phone,
//             password: hashedPassword,
//             dateOfBirth
//         });

//         await user.save();

//         res.status(201).json({ msg: 'User registered successfully' });
//     } catch (err) {
//         console.error('Error registering user:', err);
//         res.status(500).json({ msg: 'Server error' });
//     }
// };


// zod & V3 signIn
exports.register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const { firstName, secondName, lastName, email, phone, password, dateOfBirth } = validatedData;

        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ msg: 'User with this phone number already exists' });
        }

        let emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        let nameCheck = await User.findOne({ firstName, lastName });
        if (nameCheck) {
            return res.status(400).json({ msg: 'This combination of first name and last name is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            firstName,
            secondName: secondName || '',
            lastName,
            email,
            phone,
            password: hashedPassword,
            dateOfBirth: new Date(dateOfBirth)
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ msg: 'Validation error', errors: err.errors });
        }

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
