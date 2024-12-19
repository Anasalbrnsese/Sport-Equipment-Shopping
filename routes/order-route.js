// في ملف routes الخاص بالطلبات
const express = require("express");
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/products');
const User = require('../models/user');

// to check if user is loogged in 
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    res.redirect('/users/login')
};

const isMerchant = (req, res, next) => {
    if (req.user.role === 'merchant') {
        return next();
    }
    req.flash('error', 'ليس لديك الصلاحيات لإضافة منتجات.');
    res.redirect('/product'); // إعادة توجيه المستخدم إلى صفحة المنتجات
};

router.post('/confirm-order', async (req, res) => {
    try {
        // Get the user ID from the authenticated user
        const userId = req.user._id;  // This assumes req.user is set via authentication middleware
        const { username, cartItem } = req.body;



        // Find the user by their ID (using req.user._id)
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/users/profile');
        }
        // Check if the phone number is provided
        if (!user.phone) {
            req.flash('error', 'Please provide a phone number!'); 
            return res.redirect('/users/profile');
        }
        let totalPrice = 0;
        const items = [];

        // Loop through the cart items and find the corresponding product by product_id
        for (const item of cartItem) {
            const parsedItem = JSON.parse(item);

            // Find the product by its product_id (e.g., PROD-6446)
            const product = await Product.findOne({ product_id: parsedItem.productId });

            if (product) {
                // Add the item to the order
                totalPrice += parsedItem.product_price * parsedItem.quantity;
                items.push({
                    product_id: product._id, // Use MongoDB ObjectId
                    product_name: parsedItem.product_name,
                    product_price: parsedItem.product_price,
                    quantity: parsedItem.quantity
                });
            } else {
                req.flash('error', `Product with ID ${parsedItem.product_id} not found.`);
                return res.redirect('/cart');
            }
        }

        // Create the new order with phone number
        const newOrder = new Order({
            userId: userId,
            username,
            items,
            totalPrice,
            status: 'Pending',
            createdAt: Date.now()
        });

        // Save the order
        await newOrder.save();

        // Update the user's order list
        user.orders.push(newOrder._id);
        await user.save();
        req.session.cart = [];
        // Clear the cart
        await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
        
        // Redirect to the order details page
        req.flash('success', 'Your order has been placed successfully!');
        res.redirect(`/orders/order-details/${newOrder._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'There was an error processing your order.');
        res.redirect('/cart');
    }
});


router.get('/order-details/:id', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/');
        }
        res.render('layout/order-details', { order }); // Pass `order` here
    } catch (error) {
        console.error(error);
        req.flash('error', 'Order not found');
        res.redirect('/');
    }
});


router.get('/all-orders-user', isAuthenticated, async (req, res) => {
    try {
        // Fetch all orders for the logged-in user
        const orders = await Order.find({ userId: req.user._id }); // Assuming userId is stored in Order
        res.render('layout/all-orders-user', { orders });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Unable to fetch your orders.');
        res.redirect('/');
    }
});
// Route to fetch all orders
router.get('/all_orders', isAuthenticated, isMerchant, async (req, res) => {
    try {
        const orders = await Order.find(); // Fetch all orders from the database
        res.render('layout/all_orders', { orders }); // Pass the orders to the template
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/update-status', isAuthenticated, isMerchant, async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;

        // Validate input
        if (!orderId || !['Preparing', 'On the Way', 'Completed'].includes(newStatus)) {
            req.flash('error', 'Invalid status or order ID.');
            return res.redirect('/orders/all_orders');
        }

        // Find and update the order
        const order = await Order.findById(orderId);
        if (!order) {
            req.flash('error', 'Order not found.');
            return res.redirect('/orders/all_orders');
        }

        order.status = newStatus; // Update the status
        await order.save();

        req.flash('success', `Order status updated to "${newStatus}" successfully!`);
        res.redirect('/orders/all_orders');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update order status.');
        res.redirect('/orders/all_orders');
    }
});


module.exports = router;