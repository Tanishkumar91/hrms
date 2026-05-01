const express = require('express');
const router = express.Router();
const { verifyWebhook, receiveMessage } = require('../controllers/whatsappController');

// Meta requires a GET request for verification and a POST request for receiving messages
router.route('/webhook')
    .get(verifyWebhook)
    .post(receiveMessage);

module.exports = router;
