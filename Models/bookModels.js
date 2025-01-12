// bookModels.js (Mongoose schema)

import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index:true },
  author: { type: String, required: true },
  publishYear: { type: Number, required: true },
  image: { type: String, required: true },  // Base64 or URL image
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true  },
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
