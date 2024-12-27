// admin dashboard route
const express = require('express');
const router = express.Router();
const Product = require('../models/products'); // Assume Product schema exists
const Order = require('../models/order'); // Assume Order schema exists
const User = require('../models/user'); // Assume User schema exists
const Feedback = require('../models/feedback'); // Assume Feedback schema exists
const { isAdmin } = require('../middlewares/auth');

// Middleware to ensure only admins can access
router.use(isAdmin);

// Dashboard Route
router.get('/dashboard', isAdmin, async (req, res) => {
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
            feedback
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;
