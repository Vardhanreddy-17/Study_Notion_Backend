const mongoose = require("mongoose")

require("dotenv").config()

exports.connect = () =>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("Connection successfull with db"))
    .catch((error)=>{
        console.log(error);
        console.log("Error occured while connectiong to db");
        process.exit(1);
    });
};
