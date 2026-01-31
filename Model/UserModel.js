const mongoose = require('mongoose');
const joi = require('joi');

const UserSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:[true, 'Please add a first name'],
        trim: true
    },
    lastname:{
        type:String,
        required:[true, 'Please add a last name'],
        trim: true
    },
    email:{
        type:String,
        required:[true, 'Please add a email'],
        unique:true
    },
    password:{
        type:String,
        required:[true, 'Please add a password']
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
},{ timestamps:true })

const UserModel = mongoose.model('users',UserSchema)

const ValidateUser = (body)=>{
    const schema = joi.object({
        firstname:joi.string().required(),
        lastname:joi.string().required(),
        email:joi.string().email({ tlds: { allow: false } }).required(),
        password:joi.string().required(),
        role:joi.string().valid('user','admin')
    })
    return schema.validate(body)
}

const ValidateLogin = (body)=>{
    const schema = joi.object({
        email:joi.string().email({ tlds: { allow: false } }).required(),
        password:joi.string().required()
    })
    return schema.validate(body)
}
module.exports = { UserModel, ValidateUser, ValidateLogin }