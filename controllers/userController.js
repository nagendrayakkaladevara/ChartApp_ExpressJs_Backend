const User = require("../models/userModel");

exports.getUserFriends = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('friends', 'phone name id');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        res.status(200).json(user.friends);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.addFriendsToUser = async (req, res) => {
    const { userId } = req.params;
    const { phoneNumber } = req.body;

    try {
        const friend = await User.findOne({ phone: phoneNumber });
        if (!friend) return res.status(404).json({ message: 'Friend not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let message = '';

        const isFriendInUser = user.friends.includes(friend._id);
        const isUserInFriend = friend.friends.includes(user._id);

        if (isFriendInUser && isUserInFriend) {
            return res.status(200).json({ message: 'This friend is already added to both records.' });
        }

        if (!isFriendInUser) {
            user.friends.push(friend._id);
            message += 'Friend added to your friends list. ';
        } else {
            message += 'Friend was already in your friends list. ';
        }

        if (!isUserInFriend) {
            friend.friends.push(user._id);
            message += 'You were added to your friend\'s list.';
        } else {
            message += 'You were already in your friend\'s list.';
        }

        await user.save();
        await friend.save();

        res.status(201).json({ message: message.trim(), name: friend.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getNameAndId = async (req, res) => {
    try {
        const users = await User.find({}, 'name id');
        res.status(201).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.userSearch = async (req, res) => {
    const { phone } = req.body;

    try {
        const user = await User.findOne({ phone: phone });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ user: user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};