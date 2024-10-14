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
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     phone: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     dateOfBirth: {
//         type: Date,
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


// v3 module
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
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
    profilePicture: {
        type: String,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
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
