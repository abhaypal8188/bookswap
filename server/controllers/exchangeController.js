const Exchange = require('../models/Exchange');
const Book = require('../models/Book');

// @desc    Create exchange request
// @route   POST /api/exchange/request
// @access  Private
const createExchangeRequest = async (req, res) => {
  try {
    const { requestedBookId, offeredBookId } = req.body;

    const requestedBook = await Book.findById(requestedBookId);
    if (!requestedBook) {
      return res.status(404).json({ message: 'Requested book not found' });
    }

    const offeredBook = await Book.findById(offeredBookId);
    if (!offeredBook) {
      return res.status(404).json({ message: 'Offered book not found' });
    }

    // Ensure users aren't requesting their own books
    if (requestedBook.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request your own book' });
    }

    // Ensure the offered book belongs to the user
    if (offeredBook.ownerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'You can only offer your own books' });
    }

    // Check if an exchange already exists
    const exchangeExists = await Exchange.findOne({
      senderId: req.user._id,
      requestedBookId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    if (exchangeExists) {
      return res.status(400).json({ message: 'Exchange request already exists for this book' });
    }

    const exchange = new Exchange({
      senderId: req.user._id,
      receiverId: requestedBook.ownerId,
      requestedBookId,
      offeredBookId,
    });

    const createdExchange = await exchange.save();

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(requestedBook.ownerId.toString()).emit('new_exchange_request', {
        message: 'You have a new book exchange request!',
        exchangeId: createdExchange._id
      });
    }

    res.status(201).json(createdExchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's exchange requests (sent and received)
// @route   GET /api/exchange/myrequests
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const sentRequests = await Exchange.find({ senderId: req.user._id })
      .populate('receiverId', 'name avatar')
      .populate('requestedBookId', 'title image')
      .populate('offeredBookId', 'title image')
      .sort({ createdAt: -1 });

    const receivedRequests = await Exchange.find({ receiverId: req.user._id })
      .populate('senderId', 'name avatar')
      .populate('requestedBookId', 'title image')
      .populate('offeredBookId', 'title image')
      .sort({ createdAt: -1 });

    res.json({ sentRequests, receivedRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update exchange status
// @route   PUT /api/exchange/:id/status
// @access  Private
const updateExchangeStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted', 'Rejected', 'Completed'
    
    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' });
    }

    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange request not found' });
    }

    // Only the receiver can Accept/Reject
    // Both can mark as Completed after Acceptance
    if (
      exchange.receiverId.toString() !== req.user._id.toString() &&
      exchange.senderId.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized to update this exchange' });
    }

    if (['Accepted', 'Rejected'].includes(status)) {
       if(exchange.receiverId.toString() !== req.user._id.toString()) {
           return res.status(401).json({ message: 'Only the book owner can accept or reject the request' });
       }
    }

    exchange.status = status;
    const updatedExchange = await exchange.save();

    // If accepted or completed, update book availability
    if (status === 'Accepted' || status === 'Completed') {
      await Book.findByIdAndUpdate(exchange.requestedBookId, { available: false });
      await Book.findByIdAndUpdate(exchange.offeredBookId, { available: false });
    }

    // If rejected, ensure books are available
    if (status === 'Rejected') {
      await Book.findByIdAndUpdate(exchange.requestedBookId, { available: true });
      await Book.findByIdAndUpdate(exchange.offeredBookId, { available: true });
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      const notifyUserId = exchange.senderId.toString() === req.user._id.toString() 
        ? exchange.receiverId.toString() 
        : exchange.senderId.toString();

      io.to(notifyUserId).emit('exchange_status_updated', {
        message: `Your exchange request was ${status.toLowerCase()}`,
        exchangeId: updatedExchange._id,
        status
      });
    }

    res.json(updatedExchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExchangeRequest,
  getMyRequests,
  updateExchangeStatus,
};
