const  Chat  = require('../Models/chatModel.js')
const  User  = require('../Models/userModel.js')

const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupMembersId } = req.body;
        console.log(typeof groupMembersId)
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
                return res.status(404).json({ message: `Friend with Id ${groupMemberId} not found` });
            }
            groupMembers.push(groupMemberId);
        }
        let title = (groupMembers.length == 1) ? 'singleChat' : 'groupChat';
        chat = await Chat.create({
            createdBy: userId,
            members: [userId, ...groupMembers],
            title: title
        })
        const user = await User.findById(userId);
        user.chat.push(chat._id);
        await user.save();

        return res.status(201).json({ message: "Chat created successfully", chat });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createChat,deleteChat };