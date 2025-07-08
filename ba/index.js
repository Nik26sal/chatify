const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const dbConnect = require('./Database/db.js');
const userRoutes = require('./routes/userRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const cookieParser = require('cookie-parser');
const messageRoutes = require('./routes/messageRoutes.js');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

dbConnect();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to the Chatify');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.listen(PORT, () => {
    console.log(`Server is running correctly on the Port ${PORT}`);
});
