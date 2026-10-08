const userModel=require('../models/user.model')
const emailService =require('../services/email.service')
const jwt= require('jsonwebtoken')

const userRegisterController = async (req,res)=>{
  const {email,password,name}=req.body
  const isExists=await userModel.findOne({ email})
  if(isExists) {
    res.status(422).json({
      message:"User already exists",
      status:"failed"
    })
  }
  const user=await userModel.create({
    email,password,name,
    
  })
  const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
  res.cookie('token',token)
  res.status(201).json({
    _id:user._id,
    email:user.email,
    name:user.name
  })
  await emailService.sendRegistrationEmail(user.email,user.name)
}
const userLoginController = async (req,res)=>{
  const {email,password}=req.body
  const user=await userModel.findOne({email}).select("+password")
  if(! user){
    return res.status(402).json({
      message:"Email or password invalid"
    })
  }
  const isValidPassword=await user.comparePassword(password)
  if(!isValidPassword){
     return res.status(402).json({
      message:"Email or password invalid"
    })
  }

   const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
   console.log(token);
   
  res.cookie('token',token)
  res.status(200).json({
    _id:user._id,
    email:user.email,
    name:user.name
  })

  
}

module.exports={
  userRegisterController,
  userLoginController
}