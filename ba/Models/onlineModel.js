const mongoose = require('mongoose');

const onlineUsers = new mongoose.Schema(
    {
        users:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ]
    },
    {
        timestamps:true
    }
)

module.exports = onlineUsers;