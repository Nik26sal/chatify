const { sendMessage, deleteMessage, getAllMessage } = require("../controller/messageController");
const authorizeduser =require('../middlewares/authorized.js')
const express = require('express');
const router = express.Router();

router.post('/sendMessage',authorizeduser,sendMessage);
router.delete('/deleteMessage',authorizeduser,deleteMessage);
router.get('/getAllMessage',authorizeduser,getAllMessage);


module.exports = router;