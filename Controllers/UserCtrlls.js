const { UserModel, ValidateUser, ValidateLogin, ValidateForgetPassword } = require('../Model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const crypto = require('crypto');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const GetAllUser = async(req,res)=>{
    try {
        const Users = await UserModel.find();
        res.send({status:true, message:Users});
    } catch (error) {
        res.send({status:false, message:error.message})
    }
}

const GetUserById = async(req,res)=>{
    try {
        const id = req.params.id;
        const User = await UserModel.findById(id);
        res.send({status:true, message:User});
    } catch (error) {
        res.send({status:false, message:error.message});
    }
}

const CreateUser = async(req,res)=>{
    try {
        //validate user input
        const { error } = ValidateUser(req.body);
        if(error) return res.send({status:false, message:error.message});
        //check if user exists 
        const email = req.body.email
        const CheckUserExists = await UserModel.findOne({email});
        if(CheckUserExists) return res.send({status:false, message:"User Already Exists"})
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(req.body.password, salt)
        req.body.password = hashed_password
        // console.log(hashed_password)
        // return
        //save the user if there no error 
        await new UserModel(req.body).save();
        res.send({status:true, message:`Succesfuly Created User: [${req.body.email}]`})
    } catch (error) {
        res.send({status:false, message:error.message})
    }
}

const Login = async(req,res)=>{
    try {
        //validate user input
        const { error } = ValidateLogin(req.body);
        if(error) return res.send({status:false, message:error.message});

        //check if user exists 
        const email = req.body.email
        const CheckUserExists = await UserModel.findOne({email});
        if(!CheckUserExists) return res.send({status:false, message:"incorrect email or password"})

        //get userdata
        const { password } = await UserModel.findOne({email})
        //console.log(userdata);
        //compare the password
        //const hashed_password = await bcrypt.hash(req.body.password, 10); 
        //console.log(hashed_password)
        //console.log(password)
        //return
        const checkpasswordmaches = await bcrypt.compare(req.body.password, password); 
        if(!checkpasswordmaches) return res.send({status:false, message:"incorrect email or password"})
        // req.body.password = hashed_password
        
        //save the user if there no error 
        //new UserModel(req.body).save();
        //generate token
        const token = jwt.sign({id: CheckUserExists._id,firstname:CheckUserExists.firstname,lastname:CheckUserExists.lastname,email:CheckUserExists.email},SECRET_KEY)
        // console.log(token)
        res.send({status:true, message:`Succesfuly Logged In [ User ]: [${req.body.email}]`, token:token})
    } catch (error) {
        res.send({status:false, message:error.message})
    }
}

const UpdateUser = async(req,res)=>{
    try {
        const id = req.params.id
        const Users = await UserModel.findByIdAndUpdate(id, req.body)
        res.send({status:true, message:`Succesfuly Updated User: [${req.body.email}]`})
    } catch (error) {
        res.send({status:false, message:error.message})
    }
}

const DeleteUser = async(req,res)=>{
    try {
        const id = req.params.id
        const Users = await UserModel.findByIdAndDelete(id)
        res.send({status:true, message:`Succesfuly Deleted User: ${req.body.email}.`})
    } catch (error) {
        res.send({status:false, message:error.message})
    }
}

const GoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) { return res.send({ status: false, message: "Token is required" });}

        // Verify token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name } = payload;

        // Check if user already exists
        let user = await UserModel.findOne({ email });

        if (!user) {
            // Create user without password (Google user)
            user = await new UserModel({
                firstname: given_name,
                lastname: family_name,
                email: email,
                password: "google-oauth-user", // dummy password
            }).save();
        }

        // Generate JWT token (same format as normal login)
        const appToken = jwt.sign(
            {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
            SECRET_KEY
        );

        res.send({ status: true, message: "Google login successful", token: appToken,});
    } catch (error) {
        console.log(error);
        res.send({ status: false, message: "Google login failed",});
    }
};

const ForgotPassword = async (req, res) => {
    try {
        //validate user input
        const { error } = ValidateForgetPassword(req.body);
        if(error) return res.send({status:false, message:error.message});

        const { email } = req.body;

        const user = await UserModel.findOne({ email });

        // Do NOT reveal if user exists (security best practice)
        if (!user) {
            return res.send({
                status: true,
                message: "If this email exists, a reset link was sent"
            });
        }

        // 🚨 Block Google users
        if (user.password === "google-oauth-user") {
            return res.send({
                status: false,
                message: "This account was created using Google. Please login with Google."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // TODO: send email here
        // console.log("Reset Link:", resetURL);
        await sendEmail(
            user.email,
            'Password Reset',
            `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetURL}">${resetURL}</a>
            `
        );

        res.send({
            status: true,
            message: "If this email exists, a reset link was sent"
        });

    } catch (error) {
        res.send({ status: false, message: error.message });
    }
};

// const ResetPassword = async (req, res) => {
//     try {

//         const hashedToken = crypto
//             .createHash("sha256")
//             .update(req.params.token)
//             .digest("hex");

//         const user = await UserModel.findOne({
//             resetPasswordToken: hashedToken,
//             resetPasswordExpires: { $gt: Date.now() }
//         });

//         if (!user) {
//             return res.send({
//                 status: false,
//                 message: "Invalid or expired token"
//             });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(req.body.password, salt);

//         user.password = hashedPassword;
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         await user.save();

//         res.send({
//             status: true,
//             message: "Password reset successful"
//         });

//     } catch (error) {
//         res.send({ status: false, message: error.message });
//     }
// };

const ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send({ status: false, message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.send({ status: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error.message });
  }
};

module.exports = { GetAllUser, GetUserById, CreateUser, Login, GoogleLogin, ForgotPassword, ResetPassword, UpdateUser, DeleteUser }