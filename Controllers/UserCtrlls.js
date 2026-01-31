const { UserModel, ValidateUser, ValidateLogin } = require('../Model/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY

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

module.exports = { GetAllUser, GetUserById, CreateUser, Login, UpdateUser, DeleteUser }