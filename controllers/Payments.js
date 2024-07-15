const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");

// Demo buy course function
exports.demoBuyCourse = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.id;

    console.log("Request body:", req.body);
    console.log("User ID:", userId);

    try {
        // Find the course by its ID
        const course = await Course.findById(courseId);
        console.log("Found course:", course);

        if (!course) {
            console.log("Course not found");
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Check if the user is already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId);
        // if (course.studentEnrolled.includes(uid)) {
        //     console.log("Student is already enrolled");
        //     return res.status(400).json({ success: false, message: "Student is already enrolled" });
        // }

        // Add student to the course's studentEnrolled array
        course.studentEnrolled.push(uid);
        await course.save();
        console.log("Student added to the course's studentEnrolled array");

        // Add course to the student's courses array
        const student = await User.findById(userId);
        console.log(student);
        student.courses.push(courseId);
        await student.save();
        console.log("Course added to the student's courses array");

        // Send an email notification to the enrolled student
        await mailSender(
            student.email,
            `Successfully Enrolled into ${course.courseName}`,
            courseEnrollmentEmail(course.courseName, `${student.firstName} ${student.lastName}`)
        );
        console.log("Email sent successfully");

        return res.status(200).json({
            success: true,
            message: "Course purchased and enrolled successfully",
        });
    } catch (error) {
        console.log("Error in demoBuyCourse:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
