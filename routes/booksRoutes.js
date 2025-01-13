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
      return res.status(400).json({
        message: 'All fields are required: title, author, publishYear, and image (Base64)',
      });
    }

    // Validate publishYear as a number
    if (isNaN(publishYear)) {
      return res.status(400).json({ message: 'Publish year must be a valid number' });
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
    return res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all books for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to limit 10
    const skip = (page - 1) * limit;

    const books = await Book.find({ userId: req.user.id }).skip(skip).limit(limit);
    return res.status(200).json({
      count: books.length,
      data: books,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching books:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET a single book by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, userId: req.user.id });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /:id (Update a book)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, publishYear, image } = req.body;

    const updatedBook = { title, author, publishYear };

    if (image) {
      updatedBook.image = image; // Update Base64 image if provided
    }

    const book = await Book.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updatedBook,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Error updating book:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /:id (Delete a book)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
