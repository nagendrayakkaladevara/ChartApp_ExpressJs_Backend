const Message = require("../models/messageModel");
const User = require("../models/userModel");

exports.getUserFriends = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate('friends', 'phone email id lastSeen dateOfBirth friends createdAt');
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

        if (user._id.equals(friend._id)) {
            return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
        }

        let message = '';

        const isFriendInUser = user.friends.includes(friend._id);
        const isUserInFriend = friend.friends.includes(user._id);

        if (isFriendInUser && isUserInFriend) {
            return res.status(409).json({ message: 'This friend is already added to both records.' });
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

exports.sendFriendRequest = async (req, res) => {
    const { userId } = req.params; // the user making the request
    const { phoneNumber } = req.body; // the phone number of the friend to add

    try {
        // Find the friend by phone number
        const friend = await User.findOne({ phone: phoneNumber });
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        // Find the user making the request
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if they are already friends or if there's already a pending request
        const isAlreadyFriends = user.friends.includes(friend._id);
        const hasPendingRequest = user.friendRequests.some(
            (request) => request.friendId.toString() === friend._id.toString()
        );

        if (isAlreadyFriends) {
            return res.status(409).json({ message: 'You are already friends.' });
        }

        if (hasPendingRequest) {
            return res.status(409).json({ message: 'Friend request already sent.' });
        }

        // Add friend request to both users
        user.friendRequests.push({ friendId: friend._id, status: 'accepted' });
        friend.friendRequests.push({ friendId: user._id, status: 'pending' });

        // Save both users
        await user.save();
        await friend.save();

        res.status(200).json({ message: 'Friend request sent successfully.' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPendingFriendRequests = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the user by ID
        const user = await User.findById(userId).populate('friendRequests.friendId', 'firstName lastName phone email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out pending friend requests
        const pendingRequests = user.friendRequests.filter(request => request.status === 'pending');

        // Return pending requests
        res.status(200).json({ pendingRequests });
    } catch (err) {
        console.error('Error fetching pending friend requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.handleFriendRequest = async (req, res) => {
    const { userId } = req.params; // User who is handling the request
    const { friendId, action } = req.body; // Friend who sent the request and action ('accept' or 'reject')

    try {
        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the pending friend request in the user's friendRequests array
        const friendRequestIndex = user.friendRequests.findIndex(request => request.friendId.equals(friendId) && request.status === 'pending');

        if (action === 'accept') {
            // Accept the friend request
            if (friendRequestIndex === -1) {
                return res.status(400).json({ message: 'No pending friend request found.' });
            }

            // Add friend to both users' friends lists
            const friend = await User.findById(friendId);
            if (!friend) {
                return res.status(404).json({ message: 'Friend not found.' });
            }

            // Check if they are already friends
            if (user.friends.includes(friend._id) || friend.friends.includes(user._id)) {
                return res.status(409).json({ message: 'Already friends.' });
            }

            user.friends.push(friend._id);
            friend.friends.push(user._id);

            // Remove the friend request
            // user.friendRequests.splice(friendRequestIndex, 1);
            // friend.friendRequests.splice(friendRequestIndex, 1);

            await user.save();
            await friend.save();

            return res.status(200).json({ message: 'Friend request accepted successfully.' });
        } else if (action === 'reject') {
            // Reject the friend request
            if (friendRequestIndex === -1) {
                return res.status(400).json({ message: 'No pending friend request found.' });
            }

            // Remove the friend request
            user.friendRequests.splice(friendRequestIndex, 1);
            await user.save();

            return res.status(200).json({ message: 'Friend request rejected successfully.' });
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject".' });
        }
    } catch (err) {
        console.error('Error handling friend request:', err);
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

exports.postUserLastSeen = async (req, res) => {
    const { userId } = req.params;
    const { lastSeen } = req.body;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.lastSeen = lastSeen || Date.now();

        await user.save();

        res.json({ message: 'Last seen updated', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessageNotification = async (req, res) => {
    const { userId } = req.params;

    try {
        // Step 1: Get the user's last seen time
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const lastSeen = new Date(user.lastSeen); // Ensure lastSeen is a Date object

        // Step 2: Fetch messages sent to the user after their last seen time
        const messages = await Message.find({
            receiver: userId, // Adjusted to match the receiver field in your message schema
            createdAt: { $gt: lastSeen }, // Messages after last seen time
        }).populate('sender'); // Populate sender information

        // Step 3: Prepare the response
        const notifications = messages.reduce((acc, message) => {
            const senderId = message.sender._id.toString();
            // Increment count for each sender
            acc[senderId] = (acc[senderId] || { sender: message.sender, count: 0 });
            acc[senderId].count++;
            return acc;
        }, {});

        // Convert the notifications object to an array
        const response = Object.values(notifications).map(notification => ({
            sender: {
                _id: notification.sender._id,
                firstName: notification.sender.firstName,
                lastName: notification.sender.lastName,
            },
            count: notification.count,
        }));

        // Step 4: Send response
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching message notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};