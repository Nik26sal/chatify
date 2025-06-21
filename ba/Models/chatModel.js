const mongoose = require('mongoose');

const chatModel = new mongoose.Schema({
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
    }
},
{
    timestamps: true
});

const Chat = mongoose.model('Chat',chatModel);
module.exports = Chat;