import mongoose from "mongoose";

 const chairSchema = mongoose.Schema({
    title:{type:String, required:true},
    author:{type:String, required:true},
    publishYear:{type:Number, required:true},
 }, { timeStamps:true});

 const Book= mongoose.model('mychair', chairSchema)
 export default Chair