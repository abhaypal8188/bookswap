const express = require('express');
const router = express.Router();
const {
  createExchangeRequest,
  getMyRequests,
  updateExchangeStatus,
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, createExchangeRequest);
router.get('/myrequests', protect, getMyRequests);
router.put('/:id/status', protect, updateExchangeStatus);

module.exports = router;
