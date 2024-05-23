const Course = require("../models/Course")
const User = require("../models/User")
const Tag = require("../models/Category")
const uploadImageToCloudinary = require("../utils/imageUploader");

//create course handler 
exports.createCourse  = async(req,res) =>{
    try{
        //fetch dat from body 
        const {courseName, courseDescription, whatYouwillLearn, price, tag} = req.body

        // get thumbnail 
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouwillLearn || price || tag){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //check for instructor 
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details ",instructorDetails);
        //TODO: Verify that userId and instructorDetails._id are same or different?

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }

        //check given tag is valid or not
        const tagDetails  = await Tag.findById(tag);

        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found",
            });
        }

        //upload image top cloudinary 
        const thumbnailImage = await uploadImageToCloudinary(thumbanil,process.env.FOLDER_NAME)

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails,
            whatWillYouLearn:whatYouwillLearn,
            price:price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        //add new course to the user schema of instructor
        
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        )

        //update tag ka schema
        await Tag.findByIdAndUpdate(
            {_id:tagDetails._id},
            {
                $push:{
                    course:newCourse._id,
                }
            },
            {new:true},
        )
        //return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message,
        });

    }
};

//getAllCoursehandler function 

exports.showAllCourses = async(req,res) => {
    try{
        //change the statement incrementally 
        const allCourses = await Course.find({});
    
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        });
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
            select: "-videoUrl",
          },
        })
        .exec()
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }