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

router.put('/users/:id/block-unblock', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the isVerified status
        user.isVerified = !user.isVerified;
        await user.save();

        // If the user is blocked and is currently logged in, log them out
        if (!user.isVerified && req.user._id.toString() === user._id.toString()) {
            req.logout();  // Log the user out if they are the one being blocked
            return res.status(200).json({
                message: 'Your account has been blocked. You have been logged out.',
                user,
            });
        }

        // Success response
        res.status(200).json({
            message: `User account ${user.isVerified ? 'unblocked' : 'blocked'} successfully.`,
            user,
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router;
