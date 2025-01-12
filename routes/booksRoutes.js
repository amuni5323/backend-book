import express from 'express';
import Book from '../Models/bookModels.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// POST / (Create a new book)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, author, publishYear, image } = req.body;

    // Validate required fields
    if (!title || !author || !publishYear || !image) {
      return res.status(400).send({
        message: 'All fields are required: title, author, publishYear, and image (Base64)',
      });
    }

    // Construct the new book object
    const newBook = {
      title,
      author,
      publishYear,
      image, // Store Base64 image directly
      userId: req.user.id,
    };

    const book = await Book.create(newBook);
    return res.status(201).send(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// GET all books for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided
    const skip = (page - 1) * limit;



    const books = await Book.find({ userId: req.user.id }).skip(skip).limit(limit);

    
    return res.status(200).json({ count: books.length, data: books, page,
      limit, });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// GET a single book by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, userId: req.user.id });

    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }

    res.status(200).send(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// PUT /:id (Update a book)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, publishYear, image } = req.body;

    const updatedBook = {
      title,
      author,
      publishYear,
    };

    if (image) {
      updatedBook.image = image; // Update the Base64 image if provided
    }

    const book = await Book.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updatedBook,
      { new: true }
    );

    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }

    res.status(200).send(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

// DELETE /:id (Delete a book)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }

    res.status(200).send({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

export default router;
