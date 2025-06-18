const { Chat } = require('../Models/chatModel.js')
const { User } = require('../Models/userModel.js')

const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupMembersId } = req.body;

        if (!Array.isArray(groupMembersId) || groupMembersId.length < 1) {
            return res.status(400).json({ message: "Friend ID array is required" });
        }
        let groupMembers = [];
        for (const groupMemberId of groupMembersId) {
            if (userId.toString() === groupMemberId) {
                return res.status(400).json({ message: "You cannot chat with yourself" });
            }

            const friend = await User.findById(groupMemberId);
            if (!friend) {
                return res.status(404).json({ message: "Friend not found" });
            }
            groupMembers.push(groupMemberId);
        }

        chat = await Chat.create({
            users: [userId, ...groupMembers]
        });

        return res.status(201).json({ message: "Chat created successfully", chat });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createChat };