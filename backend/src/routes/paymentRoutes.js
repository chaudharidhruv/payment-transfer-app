const express = require('express');
const router = express.Router();

// Send Money Route (POST)
router.post('/send-money', (req, res) => {
    const { senderId, receiverId, amount } = req.body;

    if (!senderId || !receiverId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({ message: `Sent $${amount} from ${senderId} to ${receiverId}` });
});

// Request Money Route (POST)
router.post('/request-money', (req, res) => {
    const { requesterId, payerId, amount } = req.body;

    if (!requesterId || !payerId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({
        message: `User ${requesterId} requested $${amount} from User ${payerId}`,
        request: { requesterId, payerId, amount }
    });
});

// Get Transactions Route (GET)
router.get('/transactions', (req, res) => {
    const userId = req.query.userId; // Example: /transactions?userId=123

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    res.json({ transactions: [`Transaction history for user ${userId}`] });
});

module.exports = router;
