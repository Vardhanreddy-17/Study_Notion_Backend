const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    // Extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // Log token
    console.log("Extracted token:", token);

    // If token is missing return response
    if (!token) {
      console.log("Token is missing");
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify the token
    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decode);
      req.user = decode;
    } catch (error) {
      // Verification issue
      console.log("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    console.log("Error in auth middleware:", error.message);
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
  try {
    console.log("Checking if user is a student:", req.user);
    if (req.user.accountType !== "Student") {
      console.log("User is not a student");
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Students only",
      });
    }
    next();
  } catch (error) {
    console.log("Error in isStudent middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    console.log("Checking if user is an instructor:", req.user);
    if (req.user.accountType !== "Instructor") {
      console.log("User is not an instructor");
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Instructor only",
      });
    }
    next();
  } catch (error) {
    console.log("Error in isInstructor middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    console.log("Checking if user is an admin:", req.user);
    if (req.user.accountType !== "Admin") {
      console.log("User is not an admin");
      return res.status(401).json({
        success: false,
        message: "This is a protected role for Admin only",
      });
    }
    next();
  } catch (error) {
    console.log("Error in isAdmin middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
