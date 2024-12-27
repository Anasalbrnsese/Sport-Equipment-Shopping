const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback'); // Assuming you have a Feedback model
const { isAuthenticated } = require('../middlewares/auth');

router.post('/submit', isAuthenticated, async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const userId = req.user._id; // Ensure user ID comes from the authenticated user

        // Validate input
        if (!orderId || !rating || !comment) {
            req.flash('error', 'All fields are required.');
            return res.redirect(`/orders/order-details/${orderId || ''}`); // Handle undefined orderId
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ orderId, userId });
        if (existingFeedback) {
            req.flash('error', 'You have already submitted feedback for this order.');
            return res.redirect(`/orders/order-details/${orderId}`);
        }

        // Save feedback to the database
        const newFeedback = new Feedback({
            orderId,
            userId,
            rating,
            comment,
            createdAt: Date.now()
        });
        await newFeedback.save();

        req.flash('success', 'Thank you for your feedback!');
        res.redirect(`/orders/order-details/${orderId}`);
    } catch (error) {
        console.error(error);

        // Handle undefined orderId safely
        const redirectOrderId = req.body.orderId || '';
        req.flash('error', 'Failed to submit feedback.');
        res.redirect(`/orders/order-details/${redirectOrderId}`);
    }
});

module.exports = router;
