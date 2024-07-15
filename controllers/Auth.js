const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const bcrypt = require("bcrypt");
require("dotenv").config();
const Profile = require("../models/Profile")
//send OTP
exports.sendOTP = async(req,res) =>{
    try{
        //fetch email form body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        //if user already exist
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User  already registered",
            });
        }
        //generate otp
        //Not a good code for otp practice it is brute force approach
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })

        console.log("OTP generated ",otp);

        const result = await OTP.findOne({otp:otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
        result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            messgae:error.message,
        })
    }
};

//sign up 
exports.signUp = async (req, res) => {
    try {
      // Destructure fields from the request body
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
      } = req.body
      // Check if All Details are there or not
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !otp
      ) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        })
      }
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Password and Confirm Password do not match. Please try again.",
        })
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please sign in to continue.",
        })
      }
  
      // Find the most recent OTP for the email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
      console.log(response)
      if (response.length === 0) {
        // OTP not found for the email
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        });
      } else if (otp !== response[0].otp) {
        // Invalid OTP
        return res.status(400).json({
          success: false,
          message: "The OTP is wrong",
        });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Create the user
      let approved = ""
      approved === "Instructor" ? (approved = false) : (approved = true)
  
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      })
      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
      })
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      })
    }
};
exports.login = async (req,res) => {
    try{
        //get data from body
        const { email , password } = req.body;
        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields required, please try again",
            });
        }
        //user check exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered , please sign up",
            });
        }
        //generate JWT token after passowrd match
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            })
            user.token = token;
            user.password = undefined;

             //create cookie and send response
             const options = {
                expires:new Date(Date.now()+3*24*60*60*100),
                httpOnly:true,
             }
             res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully",
             })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            })
        }
    }catch(error){
        console.log(error),
        res.status(500).json({
            success:false,
            message:"Login failure,Please try again",
        });
    }
};


exports.changePassword = async(req,res) =>{
    //get data from body
    const { oldPassword, newPassword, confirmPassword } = req.body
    //get oldpassword,newpassword,confirmpassword
    //validation
    if(!oldPassword || !newPassword || !confirmPassword){
        return res.status(403).json({
            success:false,
            message:"Please fill all fields",
        });
    }
    //update pwd in db
    const hashedPassword = await bcrypt.hash(newPassword,10);
    // const updatedPassword = await User.findByIdAndUpdate({user.id:_id},)
    //send mail to password change
    //return response
}