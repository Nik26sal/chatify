const express = require('express');
const { addUser, loginUser, logoutUser, updateDetails, deleteUser, updatePassword, updateAvatar ,refreshAccessToken} = require('../controller/userController');
const { upload } = require('../cloudItems/multer.js');
const authorizeduser = require('../middlewares/authorized.js');

const router = express.Router();

router.post('/addUser', upload.single('avatar'), addUser);
router.post('/login', loginUser);
router.get('/logout', authorizeduser,logoutUser);
router.get('/refreshToken',refreshAccessToken);
router.patch('/update', authorizeduser, updateDetails);
router.patch('/updatePassword', authorizeduser, updatePassword);
//These Two left From testing
router.patch('/updateAvatar', authorizeduser, upload.single('avatar'), updateAvatar);
router.delete('/deleteAccount', authorizeduser, deleteUser);

module.exports = router;