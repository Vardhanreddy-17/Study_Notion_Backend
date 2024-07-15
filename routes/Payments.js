// Import the required modules
const express = require("express")
const router = express.Router()

const { demoBuyCourse } = require("../controllers/Payments")
const { auth, isStudent } = require("../middlewares/auth")
router.post("/demoBuyCourse", auth, isStudent, demoBuyCourse);

module.exports = router