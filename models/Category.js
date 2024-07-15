const mongoose = require("mongoose")

exports.tagsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        trim:true,
    },
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
});

module.exports = mongoose.model("Tags",this.tagsSchema);