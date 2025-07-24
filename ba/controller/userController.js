const { uploadCloudinary } = require('../cloudItems/cloudinary.js');
const User = require('../Models/userModel');
const jwt = require('jsonwebtoken')

const addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Submit all fields Please" });
        }
        const exsitedUser = await User.findOne({ email });
        if (exsitedUser) {
            return res.status(401).json({ message: "This user already exists." });
        }
        let avatar = null;
        if (req.file?.fieldname === 'avatar') {
            try {
                const avatarUploadResult = await uploadCloudinary(req.file.path);
                if (!avatarUploadResult?.secure_url) {
                    return res.status(500).json({ message: "Failed to upload avatar." });
                }
                avatar = avatarUploadResult.secure_url;
            } catch (uploadError) {
                console.error("Avatar Upload Error:", uploadError);
                return res.status(500).json({ message: "Error uploading avatar." });
            }
        } else {
            return res.status(400).json({ message: "Avatar is required." });
        }
        const user = await User.create({ name, email, password, avatar });
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            return res.status(500).json({ message: "Something went wrong during the creating User" });
        }
        return res.status(201).json({ message: "User registered successfully.", user: createdUser });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        if (!email || !password) {
            return res.status(400).json({ message: "Fill all the details" });
        }
        let searchedUser = await User.findOne({ email: email });
        if (!searchedUser) {
            return res.status(401).json({ message: "User not exist. Please registered first." })
        }
        if (!await searchedUser.checkPassword(password)) {
            return res.status(401).json({ message: "Enter Correct Password" })
        }

        const accessToken = await searchedUser.generateAccessToken();
        const refreshToken = await searchedUser.generateRefreshToken();


        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,   
            maxAge: 24 * 60 * 60 * 1000
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        console.log(req.cookies)
        searchedUser = await User.findOne({ email: email }).select('-password');
        return res.status(201).json({ message: "User Login successfully.", user: searchedUser, accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT_SECRET);

        const user = await User.findById(payload.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = await user.generateAccessToken();

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Logout failed" });
    }
}

const updateDetails = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { name, email, description } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (description) user.description = description;
        await user.save();

        return res.status(200).json({ message: "User details updated", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const updatePassword = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Submit field Please" });
        }
        user.password = password;
        await user.save();
        return res.status(200).json({ message: "User password updated", user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateAvatar = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.file?.fieldname === 'avatar') {
            try {
                const avatarUploadResult = await uploadCloudinary(req.file.path);
                if (!avatarUploadResult?.secure_url) {
                    return res.status(500).json({ message: "Failed to upload avatar." });
                }
                user.avatar = avatarUploadResult.secure_url;
                await user.save();
                return res.status(200).json({ message: "Avatar updated successfully", avatar: user.avatar });
            } catch (uploadError) {
                console.error("Avatar Upload Error:", uploadError);
                return res.status(500).json({ message: "Error uploading avatar." });
            }
        } else {
            return res.status(400).json({ message: "Avatar is required." });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        console.log(user)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const a = await User.findByIdAndDelete(user._id);
        console.log('a : ',a)
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const retake = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

const searchUser = async (req, res) => {
    try {
        console.log("hit")
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required." });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("-password"); 

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { addUser, deleteUser, updateAvatar, updateDetails, updatePassword, loginUser, logoutUser, refreshAccessToken,retake,searchUser }