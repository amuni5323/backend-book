import mongoose from "mongoose";

 const bookSchema = mongoose.Schema({
    title:{type:String, required:true},
    author:{type:String, required:true},
    publishYear:{type:Number, required:true},
    image:{ type:String, required:false,},
    userId: { type: String, required: true },
 }, { timestamps:true});


 const Book= mongoose.model('Book', bookSchema)
 export default Book
//  book model