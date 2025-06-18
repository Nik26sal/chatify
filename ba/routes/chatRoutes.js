const express = require('express');
const router = express.Router();
const {createChat} = require('../controller/chatController.js')
const authorizeduser = require('../middlewares/authorized.js');

router.get('/createChat',authorizeduser,createChat);

module.exports = router;