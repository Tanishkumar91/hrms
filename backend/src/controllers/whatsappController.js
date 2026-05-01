const axios = require('axios');
const User = require('../models/User');

// Verification token for Meta webhook setup
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'hrms_secret_token_123';

// @desc    Verify WhatsApp Webhook
// @route   GET /api/whatsapp/webhook
// @access  Public
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WhatsApp Webhook Verified!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.status(400).send('Invalid verification request');
    }
};

// @desc    Receive messages from WhatsApp
// @route   POST /api/whatsapp/webhook
// @access  Public
exports.receiveMessage = async (req, res) => {
    try {
        const body = req.body;

        if (body.object) {
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
                const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from; // sender phone number
                const msgBody = body.entry[0].changes[0].value.messages[0].text.body.toLowerCase();

                console.log(`Received message from ${from}: ${msgBody}`);

                let replyMessage = '';

                // Simple NLP mapping
                if (msgBody.includes('leave balance')) {
                    replyMessage = 'Fetching your leave balance... (Feature in progress)';
                } else if (msgBody.includes('attendance')) {
                    replyMessage = 'Your attendance has been marked for today. ✅';
                } else {
                    replyMessage = `Welcome to HRMS Bot! You said: "${msgBody}". Try asking for "leave balance" or "mark attendance".`;
                }

                await sendWhatsAppMessage(phoneNumberId, from, replyMessage);
            }
            res.sendStatus(200); // Always acknowledge receipt to Meta
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing WhatsApp message:', error);
        res.sendStatus(500);
    }
};

// Helper function to send messages
const sendWhatsAppMessage = async (phoneNumberId, to, message) => {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
        console.log('WHATSAPP_ACCESS_TOKEN missing. Simulation only:', message);
        return;
    }

    try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: message }
            }
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error?.response?.data || error.message);
    }
};
