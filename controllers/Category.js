const Tag = require("../models/Category")

//create tag handler

exports.createCategory = async(req,res) => {
    try{
        //fecth data
        const{ name , description } = req.body;
        //validate data
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        } 
        //create entry in db 
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        })
        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//get all Tags handler

exports.showAllCategories = async (req,res) =>{
    try{
        const allTags = await Tag.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All Tags returned successfully",
            allTags,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};