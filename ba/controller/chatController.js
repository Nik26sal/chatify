const Chat = require('../Models/chatModel.js');
const User = require('../Models/userModel.js');
const { uploadCloudinary } = require('../cloudItems/cloudinary.js');

const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupMembersId, groupName } = req.body;
        let membersArray = groupMembersId;
        if (typeof groupMembersId === "string") {
            try {
                membersArray = JSON.parse(groupMembersId);
            } catch (err) {
                return res.status(400).json({ message: "Invalid format for groupMembersId" });
            }
        }
        if (!Array.isArray(membersArray) || membersArray.length < 1) {
            return res.status(400).json({ message: "Friend ID array is required" });
        }
        let groupMembers = [];
        for (const groupMemberId of membersArray) {
            if (userId.toString() === groupMemberId) {
                return res.status(400).json({ message: "You cannot chat with yourself" });
            }
            const friend = await User.findById(groupMemberId);
            if (!friend) {
                return res.status(404).json({ message: `Friend with Id ${groupMemberId} not found` });
            }
            groupMembers.push(groupMemberId);
        }
        let title = (groupMembers.length === 1) ? 'singleChat' : 'groupChat';
        let chatName;
        let groupChatAvatar = null;
        let chatAvatar;
        if (title === 'singleChat') {
            const existingChat = await Chat.findOne({
                title: 'singleChat',
                members: { $all: [userId, groupMembers[0]], $size: 2 }
            });
            if (existingChat) {
                return res.status(200).json({ message: "Chat already exists", chat: existingChat });
            }
            const friendUser = await User.findById(groupMembers[0]);
            chatName = friendUser.name;
            chatAvatar = friendUser.avatar;
        } else {
            if (req.file?.fieldname === 'groupChatAvatar') {
                try {
                    const avatarUploadResult = await uploadCloudinary(req.file.path);
                    if (!avatarUploadResult?.secure_url) {
                        return res.status(500).json({ message: "Failed to upload avatar." });
                    }
                    groupChatAvatar = avatarUploadResult.secure_url;
                } catch (uploadError) {
                    console.error("Avatar Upload Error:", uploadError);
                    return res.status(500).json({ message: "Error uploading avatar." });
                }
            } else if (!groupName) {
                return res.status(400).json({ message: "Avatar is required for group chats." });
            }

            if (groupName && groupChatAvatar) {
                chatName = groupName;
                chatAvatar = groupChatAvatar;
            } else {
                return res.status(400).json({ message: "Please provide group name and groupChat Avatar if this chat is a Group-Chat" });
            }
        }
        const chat = await Chat.create({
            createdBy: userId,
            members: [userId, ...groupMembers],
            title: title,
            chatName: chatName,
            chatAvatar: chatAvatar
        });
        const allMembers = [userId, ...groupMembers];
        await User.updateMany(
            { _id: { $in: allMembers } },
            { $push: { chat: chat._id } }
        );
        const io = req.app.get("io");
        io.emit("new_chat_created");

        return res.status(201).json({ message: "Chat created successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteChat = async (req, res) => {
    try {
        const user = req.user;
        const { chatId } = req.body;
        if (!chatId) {
            return res.status(400).json({ message: "chatId is required" });
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (!chat.members.map(id => id.toString()).includes(user._id.toString())) {
            return res.status(403).json({ message: "You are not a member of this chat" });
        }
        chat.members = chat.members.filter(id => id.toString() !== user._id.toString());
        await chat.save();
        user.chat = user.chat.filter(id => id.toString() !== chat._id.toString());
        await user.save();
        if (chat.members.length === 0) {
            await Chat.findByIdAndDelete(chatId);
            return res.status(200).json({ message: "You left the chat. Chat deleted as no members remain." });
        }
        return res.status(200).json({ message: "You have been removed from the chat" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const changeGroupName = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, newChatName } = req.body;
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.title === 'singleChat') {
            return res.status(400).json({ message: "You are unable to change the name of a single chat." });
        }
        if (user._id.toString() !== chat.createdBy.toString()) {
            return res.status(403).json({ message: "Only Admin Allowed to Change the Name of Group" });
        }
        chat.chatName = newChatName;
        await chat.save();

        return res.status(200).json({ message: "Group name changed successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const addMember = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, newUserId } = req.body;
        if (!chatId || !newUserId) {
            return res.status(400).json({ message: "Please provide chatId and newUserId" });
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.title === 'singleChat') {
            return res.status(400).json({ message: "Cannot add members to a single chat." });
        }
        if (user._id.toString() !== chat.createdBy.toString()) {
            return res.status(403).json({ message: "Only Admin Allowed to Add Members" });
        }
        if (chat.members.map(id => id.toString()).includes(newUserId.toString())) {
            return res.status(400).json({ message: "User is already a member of this chat" });
        }
        chat.members.push(newUserId);
        await chat.save();
        await User.findByIdAndUpdate(newUserId, { $push: { chat: chat._id } });
        return res.status(200).json({ message: "Member added successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const removeMember = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, removeUserId } = req.body;
        if (!chatId || !removeUserId) {
            return res.status(400).json({ message: "Please provide chatId and removeUserId" });
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.title === 'singleChat') {
            return res.status(400).json({ message: "Cannot remove members from a single chat." });
        }
        if (user._id.toString() !== chat.createdBy.toString()) {
            return res.status(403).json({ message: "Only Admin Allowed to Remove Members" });
        }
        if (!chat.members.map(id => id.toString()).includes(removeUserId.toString())) {
            return res.status(400).json({ message: "This user is not a member of this chat" });
        }
        chat.members = chat.members.filter(id => id.toString() !== removeUserId.toString());
        await chat.save();
        await User.findByIdAndUpdate(removeUserId, { $pull: { chat: chat._id } });
        return res.status(200).json({ message: "Member removed successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const changeDescription = async (req, res) => {
    try {
        const user = req.user;
        const { description, chatId } = req.body;
        if (!description || !chatId) {
            return res.status(400).json({ message: "Please provide a description and chatId to change" });
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (user._id.toString() !== chat.createdBy.toString()) {
            return res.status(403).json({ message: "Only Admin Allowed to Change Description" });
        }
        chat.description = description;
        await chat.save();
        return res.status(200).json({ message: "Description is updated Successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const changeGroupAvatar = async (req, res) => {
    try {
        const user = req.user;
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "Please provide chatId" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.title === 'singleChat') {
            return res.status(400).json({ message: "Cannot change avatar for a single chat." });
        }
        if (user._id.toString() !== chat.createdBy.toString()) {
            return res.status(403).json({ message: "Only Admin Allowed to Change Group Avatar" });
        }
        if (!req.file || req.file.fieldname !== 'groupChatAvatar') {
            return res.status(400).json({ message: "Please upload a groupChatAvatar file" });
        }
        try {
            const avatarUploadResult = await uploadCloudinary(req.file.path);
            if (!avatarUploadResult?.secure_url) {
                return res.status(500).json({ message: "Failed to upload avatar." });
            }
            chat.chatAvatar = avatarUploadResult.secure_url;
            await chat.save();
            return res.status(200).json({ message: "Group avatar changed successfully", chat });
        } catch (uploadError) {
            console.error("Avatar Upload Error:", uploadError);
            return res.status(500).json({ message: "Error uploading avatar." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({
            path: 'chat',
            populate: [
                {
                    path: 'message',
                    model: 'Message'
                },
                {
                    path: 'members',
                    model: 'User',
                    select: 'name email avatar'
                },
                {
                    path: 'createdBy',
                    model: 'User',
                    select: 'name email avatar'
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "These are your chats",
            chats: user.chat
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    createChat,
    deleteChat,
    changeGroupName,
    addMember,
    removeMember,
    changeDescription,
    changeGroupAvatar,
    getChats
};