const Chat = require('../Models/chatModel.js');
const Message = require('../Models/messageModel.js');

const sendMessage = async (req, res) => {
    try {
        const user = req.user;
        const { chatId, message } = req.body;

        if (!chatId || !message) {
            return res.status(400).json({ message: "Please provide complete data" });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (!chat.members.map(id => id.toString()).includes(user._id.toString())) {
            return res.status(403).json({ message: "You are not a member of this chat" });
        }

        const newMessage = await Message.create({
            message:message,
            sendBy:user._id,
            chat:chat._id
        });
        chat.message.push(newMessage._id);
        await chat.save();
        await newMessage.populate('sendBy');
        return res.status(201).json({message:"Message Send Successfuly",data: newMessage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const deleteMessage = async (req, res) => {
    try {
        const user = req.user;
        const { messageId } = req.body;

        if (!messageId) {
            return res.status(400).json({ message: "Please provide messageId" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        const chat = await Chat.findById(message.chat);
        if (
            message.sendBy.toString() !== user._id.toString()
        ) {
            return res.status(403).json({ message: "You are not allowed to delete this message" });
        }
        await Chat.findByIdAndUpdate(message.chat, { $pull: { messages: message._id } });

        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const getAllMessage = async (req, res) => {
    try {
        const user = req.user;
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ message: "Please provide chatId" });
        }

        const chat = await Chat.findById(chatId).populate({
            path: 'message',
            populate: { path: 'sendBy', select: 'name avatar' }
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (!chat.members.map(id => id.toString()).includes(user._id.toString())) {
            return res.status(403).json({ message: "You are not a member of this chat" });
        }

        return res.status(200).json({ messages: chat.message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllMessage,
    sendMessage,
    deleteMessage
};