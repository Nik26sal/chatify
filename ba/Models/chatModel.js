const mongoose = require('mongoose');

const chatModel = new mongoose.Schema({
    chatAvatar:{
        type:String,
        required:true
    },
    message:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    members:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    title:{
        type:String,
        enum:['singleChat', 'groupChat']
    },
    chatName:{
        type:String,
        required:true
    },
    chatdescription:{
        type:String,
        default:"Have a Good Group Chat with Chatify"
    }
},
{
    timestamps: true
});

const Chat = mongoose.model('Chat',chatModel);
module.exports = Chat;