const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const condition = req.query.condition ? { condition: req.query.condition } : {};
    
    // Default to only showing available books unless specified
    const available = req.query.all ? {} : { available: true };

    const books = await Book.find({ ...keyword, ...category, ...condition, ...available })
      .populate('ownerId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('ownerId', 'name avatar bio location');

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
  try {
    const { title, author, category, condition, image, description } = req.body;

    const book = new Book({
      title,
      author,
      category,
      condition,
      image: image || 'https://via.placeholder.com/150x200?text=No+Cover',
      description,
      ownerId: req.user._id,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const { title, author, category, condition, image, description, available } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      // Check if user is the owner
      if (book.ownerId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to update this book' });
      }

      book.title = title || book.title;
      book.author = author || book.author;
      book.category = category || book.category;
      book.condition = condition || book.condition;
      book.image = image || book.image;
      book.description = description || book.description;
      if (available !== undefined) {
        book.available = available;
      }

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      // Check if user is the owner
      if (book.ownerId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized to delete this book' });
      }

      await book.deleteOne();
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's books
// @route   GET /api/books/user/me
// @access  Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getMyBooks,
};
