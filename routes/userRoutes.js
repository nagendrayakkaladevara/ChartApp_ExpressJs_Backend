const express = require('express');
const basicAuth = require('../middleware/basicAuth');
const { getUserFriends, addFriendsToUser, getNameAndId, userSearch } = require('../controllers/userController');

const router = express.Router();

router.get('/:userId/friends', basicAuth, getUserFriends);
router.post('/:userId/add-friend', basicAuth, addFriendsToUser);
router.get('/nameandid', basicAuth, getNameAndId);
router.post('/usersearch', basicAuth, userSearch);


module.exports = router;