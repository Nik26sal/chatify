const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const dbConnect = require('./Database/db.js')
const userRoutes = require('./routes/userRoutes.js')
const chatRoutes = require('./routes/chatRoutes.js')
const cookieParser = require('cookie-parser')

dbConnect();

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send('Welcome to the Chatify');
})

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running correctly on the Port ${PORT}`)
})
