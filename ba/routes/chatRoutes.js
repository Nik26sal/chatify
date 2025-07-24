const express = require('express');
const { upload } = require('../cloudItems/multer.js');
const router = express.Router();
const {createChat, deleteChat, changeGroupName, changeGroupAvatar, addMember,removeMember,changeDescription,getChats} = require('../controller/chatController.js')
const authorizeduser = require('../middlewares/authorized.js');

router.post('/createChat',authorizeduser,upload.single('groupChatAvatar'),createChat);
router.delete('/deleteChat',authorizeduser,deleteChat);
router.patch('/changeGroupName',authorizeduser,changeGroupName);
router.patch('/changegroupAvatar',authorizeduser,upload.single('groupChatAvatar'),changeGroupAvatar);
router.patch('/addMember',authorizeduser,addMember);
router.patch('/removeMember',authorizeduser,removeMember);
router.patch('/changeDescription',authorizeduser,changeDescription);
router.get('/getAll',authorizeduser,getChats)

module.exports = router;