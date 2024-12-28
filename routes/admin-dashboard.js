const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const Order = require('../models/order');
const User = require('../models/user');
const Feedback = require('../models/feedback');
const { isAdmin } = require('../middlewares/auth');

// Middleware to ensure only admins can access
router.use(isAdmin);

// Dashboard Route
router.get('/dashboard', async (req, res) => {
    try {
        const users = await User.find();
        const orders = await Order.find();
        const products = await Product.find();
        const feedback = await Feedback.find()
            .populate('orderId', 'id')
            .populate('userId', 'name email phone');

        res.render('admin/dashboard', {
            users,
            orders,
            products,
            feedback,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Block/Unblock User Route
router.put('/users/:id/block-unblock', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Toggle the user's verification status (block/unblock)
        user.isVerified = !user.isVerified;
        await user.save();

        // If the user is unblocked, log them out if they are logged in
        if (user.isVerified && req.session.userId === user._id.toString()) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send('Failed to destroy session');
                }
                res.status(200).send({
                    message: `User account unblocked successfully and logged out.`,
                    user,
                });
            });
        } else {
            res.status(200).send({
                message: `User account ${user.isVerified ? 'unblocked' : 'blocked'} successfully.`,
                user,
            });
        }

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
