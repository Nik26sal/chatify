const mongoose = require('mongoose');

const dbConnect = ()=>{
    try {
        const connectionDetails = mongoose.connect(`${process.env.MongoDBConnectionString}/chatify`)
        console.log(`Server Connected Successfully : ${connectionDetails}`)
    } catch (error) {
        console.log(`error Something went Wrong: ${error}`)
    }
}

module.exports = dbConnect;