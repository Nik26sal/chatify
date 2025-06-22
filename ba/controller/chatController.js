const Chat = require('../Models/chatModel.js');
const User = require('../Models/userModel.js');
const { uploadCloudinary } = require('../cloudItems/cloudinary.js');

const createChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupMembersId, groupName} = req.body;
        let groupChatAvatar = null;
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
                } else {
                    return res.status(400).json({ message: "Avatar is required." });
                }
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

        let title = (groupMembers.length === 1) ? 'singleChat' : 'groupChat';
        let chatName;
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

        return res.status(201).json({ message: "Chat created successfully", chat });
    } catch (error) {
        console.log(error);
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
        chat.chatName = newChatName;
        await chat.save();

        return res.status(200).json({ message: "Group name changed successfully", chat });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { createChat, deleteChat, changeGroupName };