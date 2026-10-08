const express =require('express')
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model')
async function authMiddleware(req,res,next){
  const token=req.cookies.token || req.headers.authorizations?.spilt(" ")[1]
  if(!token){
    return res.status(400).json({
      message:"Unauthorised access,Token is missing"
    })
  }
  try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    const user=await userModel.findById(decoded.userId)
    req.user=user
    return next()
  }
  catch(err){
    res.send(err)
  }
}
async function authSystemMiddleware(req,res,next){
  
}
module.exports={
  authMiddleware
}