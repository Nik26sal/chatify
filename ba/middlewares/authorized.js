const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');

const authorizeduser = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "No access token provided" });
        }
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_JWT_SECRET);

        if (!payload) {
            return res.status(401).json({ message: "Invalid or expired access token" });
        }

        const user = await User.findById(payload.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Authorization Error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = authorizeduser;