const express = require('express');
const router = express.Router();
const {createChat, deleteChat} = require('../controller/chatController.js')
const authorizeduser = require('../middlewares/authorized.js');

router.post('/createChat',authorizeduser,createChat);
router.delete('/deleteChat',authorizeduser,deleteChat);

module.exports = router;