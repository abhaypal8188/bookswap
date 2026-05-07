const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getMyBooks
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, createBook);

router.route('/user/me').get(protect, getMyBooks);

router.route('/:id')
  .get(getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;
