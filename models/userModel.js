// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     phone: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     friends: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }],
//     lastSeen: {
//         type: Date,
//         default: Date.now
//     },
//     online: {
//         type: Boolean,
//         default: false
//     }
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);

// module.exports = User;

// new model for v2 signup
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastSeen: {
        type: Date,
        default: Date.now
    },
    online: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;