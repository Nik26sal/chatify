const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:"I am a chatify user"
    },
    status:{
        type:String,
        enum:['online','offline']
    },
    chat:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Chat'
        }
    ]
},{
    timestamps:true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_JWT_SECRET ,
        { expiresIn: process.env.ACCESS_TOKEN_TIME_PERIOD }
    );
};

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.REFRESH_TOKEN_JWT_SECRET ,
        { expiresIn: process.env.REFRESH_TOKEN_TIME_PERIOD  }
    );
};


const User = mongoose.model('User', userSchema);
module.exports = User;