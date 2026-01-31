const jwt = require('jsonwebtoken');
const { UserModel } = require('../../Model/UserModel');
const SECRET_KEY = process.env.SECRET_KEY

const Auth = (role = [])=>{
    // console.log(role);
    // return
  return async(req,res,next)=>{
     try {
        //check if the user has token
        const token = req.headers['token']
        if(!token) return res.send({status:false, message:"you are not Authenticated"})
        //check if the token is real token
          jwt.verify(token,SECRET_KEY,async (err,decoded)=>{
          if(err) return res.send({status:false, message:err.message, message1:"Invalid or expired token"})
            //check if user data exists
            const userdata = await UserModel.findOne({email:decoded.email})
            if(!userdata) return res.send({status:false, message:"User not found"})
            //check user role
          if(!userdata.role.includes(role)) return res.send({status:false, message:"You are not Authorized to access this route"})
              // console.log(userdata)
            req.user = userdata
          next();
        })
    } catch (error) {
        res.send({status:false, message:error.message})
    }
    // next()
  }
}


module.exports = { Auth }