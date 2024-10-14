const express = require('express');
const basicAuth = require('../middleware/basicAuth');
const { getUserFriends, addFriendsToUser, getNameAndId, userSearch, postUserLastSeen, sendFriendRequest, getPendingFriendRequests, handleFriendRequest, sendMessageNotification } = require('../controllers/userController');

const router = express.Router();

router.get('/:userId/friends', basicAuth, getUserFriends);
router.post('/:userId/add-friend', basicAuth, addFriendsToUser);
router.post('/:userId/sendFriendRequest', basicAuth, sendFriendRequest);
router.get('/:userId/pendingFriendRequests', basicAuth, getPendingFriendRequests);
router.post('/:userId/postHandleFriendRequest', basicAuth, handleFriendRequest);
router.get('/:userId/message-notifications', basicAuth, sendMessageNotification);
router.get('/nameandid', basicAuth, getNameAndId);
router.post('/usersearch', basicAuth, userSearch); 
router.put('/:userId/lastSeen', postUserLastSeen);


module.exports = router;