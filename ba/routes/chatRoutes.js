const express = require('express');
const { upload } = require('../cloudItems/multer.js');
const router = express.Router();
const {createChat, deleteChat, changeGroupName} = require('../controller/chatController.js')
const authorizeduser = require('../middlewares/authorized.js');

router.post('/createChat',authorizeduser,upload.single('groupChatAvatar'),createChat);
router.delete('/deleteChat',authorizeduser,deleteChat);
router.patch('/changeGroupName',authorizeduser,changeGroupName);
//group chat avatar
// change group chat Avatar
// add member into new groupchat 
// remove member from group chat -- only done by person who create this chat
//change description of chat
module.exports = router;