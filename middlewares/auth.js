const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async(req,res,next) =>{
    try{
        //extract token
        const token = req.cookies.token || 
                       req.body.token || 
                       req.header("Authorisation").replcae("Bearer","")

       // if token is missing return response
       if(!token){
        return res.status(401).json({
            success:false,
            message:"Token is missing",
        });
       }

       //verify the token 
       try{
        const decode = await jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode;
       }catch(error){
        //verification -- issue
        return res.status(401).json({
            success:false,
            message:"Token is invalid",
        });
       }
       next();
    }catch(error){
        return res.stauts(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });
    }
}

//isStudent
exports.isStudent = async(req,res,next) =>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected role for Students only",
            });
        }
        next();

    }catch(error){
        return res.status(500),json({
            success:false,
            message:"User role cannot be verified, please try again",
        })
    }
}
//isInstructor
exports.isInstructor = async(req,res,next) =>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected role for Instructor only",
            });
        }
        next();

    }catch(error){
        return res.status(500),json({
            success:false,
            message:"User role cannot be verified, please try again",
        })
    }
}

//isAdmin
exports.isAdmin = async(req,res,next) =>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected role for Admin only",
            });
        }
        next();

    }catch(error){
        return res.status(500),json({
            success:false,
            message:"User role cannot be verified, please try again",
        })
    }
}