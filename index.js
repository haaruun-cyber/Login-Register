const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;
// const MONGODB = process.env.MONGODB;
const SECRET_KEY = process.env.SECRET_KEY;
app.use(cors());
app.use(express.json());
const UserRoute = require('./Route/UserRoute');
const { UserModel } = require('./Model/UserModel');
const connectDB = require('./Config/db.js');

// mongoose
//     .connect(MONGODB)
//     .then(()=>console.log("connected Succesfully To Mongodb ✅"))
//     .catch(()=>{console.log("Not connected Succesfully ❌");
//                 process.exit(1);})

// const verifytoken = async(req,res,next)=>{
//         //check if the user has token
//         const token = req.headers['token']
//         if(!token) return res.send({status:false, message:"you are not Authenticated"})
//         //check if the token is real token
//         jwt.verify(token,SECRET_KEY,async (err,decoded)=>{
//         if(err) return res.send({status:false, message:err.message, message1:"Invalid or expired token"})
//           const userdata = await UserModel.findOne({email:decoded.email})
//           if(!userdata) return res.send({status:false, message:"User not found"})
//         console.log(userdata)
//         next();
//         })
//         //console.log(token)
      
// }
// app.use(verifytoken)
app.use('/user', UserRoute);
//app.use(Auth)





app.get('/',(req,res)=>{
    res.send('Backend is live 🚀')
})

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
