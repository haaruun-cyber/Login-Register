//db.js page
const mongoose = require('mongoose');
require('dotenv').config(); 
const MONGODB = process.env.MONGODB;

const connectDB = async () => { 
    try {
        await mongoose.connect(MONGODB);
        console.log("Connected Successfully To Mongodb ✅");
    } catch (error) {
        console.log("Not connected Successfully To Mongodb ❌", error);
        process.exit(1);
    }
};

module.exports = connectDB;