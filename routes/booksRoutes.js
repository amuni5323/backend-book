import express from 'express';
import Book from '../Models/bookModels.js';
import authenticate from '../middleware/authenticate.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// POST / (Create a new book)
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
console.log("user id",req.user.id)
    if (!title || !author || !publishYear) {
      return res.status(400).send({ message: "All fields are required: title, author, publishYear" });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/Uploads/${req.file.filename}`;
    }

    const newBook = {
      title,
      author,
      publishYear,
      image: imageUrl,
      userId: req.user.id, 
    };

    const book = await Book.create(newBook);
    return res.status(201).send(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// GET / (Get all books for logged-in user)
router.get('/', authenticate, async (req, res) => {
  try {
    console.log("executing..")
    const books = await Book.find({ userId: req.user.id }); 
    return res.status(200).json({ count: books.length, data: books });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// GET /:id (Get a specific book by ID)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, userId: req.user.id });
    if (!book) {
      return res.status(404).json({ message: "Book not found or not authorized" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// PUT /:id (Update a book)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;
    const { id } = req.params;

    if (!title || !author || !publishYear) {
      return res.status(400).send({ message: "All fields are required: title, author, publishYear" });
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id, userId: req.user.id }, 
      req.body,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found or not authorized" });
    }

    return res.status(200).send({ message: "Book updated successfully", data: updatedBook });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// DELETE /:id (Delete a book)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findOneAndDelete({ _id: id, userId: req.user.id }); 
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found or not authorized" });
    }

    return res.status(200).send({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

export default router;
