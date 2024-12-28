const express = require('express');
const router = express.Router();
const Product = require('../models/products');
const Order = require('../models/order');
const User = require('../models/user');
const Feedback = require('../models/feedback');
const { isAdmin } = require('../middlewares/auth');
const { getIO } = require('../utils/socket-io');
const { default: mongoose } = require('mongoose');

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
            feedback,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/users/:id/block-unblock', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle the isVerified status
        user.isVerified = !user.isVerified;
        await user.save();

        // Find the session associated with the user

        const session = await mongoose.connection.collection('sessions').findOne({
            'session.passport.user': user._id.toString()
        });



        if (session) {
            // Remove the session
            await mongoose.connection.collection('sessions').deleteOne({ _id: session._id });
            console.log('Session removed for user:', user._id);
            getIO().to(`user-${user._id}`).emit('session-expired', 'Your session has been terminated. Please log in again')
        } else {
            console.log('No active session for the user.');
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
