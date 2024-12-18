// في ملف routes الخاص بالطلبات
const express = require("express");
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/products');

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
        const { user_id, username, cartItem } = req.body;

        if (!cartItem || cartItem.length === 0) {
            req.flash('error', 'Your cart is empty!');
            return res.redirect('/cart');
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
                // Handle the case where the product is not found
                req.flash('error', `Product with ID ${parsedItem.product_id} not found.`);
                console.log(product);
                return res.redirect('/cart');

            }
        }
        // Now create the new order after gathering the data
        const newOrder = new Order({
            userId: user_id,
            username,
            items,
            totalPrice,
            status: 'Pending',
            createdAt: Date.now()
        });

        // Save the order
        await newOrder.save();
        // Empty the cart in the session
        req.session.cart = [];
        // Mark the order as confirmed to prevent saving the cart during logout
        req.session.orderConfirmed = true;
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

module.exports = router;

// router.get('/my-orders', async (req, res) => {
//     // try {
//     //     const user = await user.findById(req.user._id).populate('orders');

//     //     res.render('my-orders', {
//     //         title: 'My Orders',
//     //         orders: user.orders,
//     //     });
//     // } catch (err) {
//     //     console.error(err);
//     //     req.flash('error', 'Error retrieving your orders.');
//     //     res.redirect('/');
//     // }
// });
// router.get('/all-orders', async (req, res) => {
//     // try {
//     //     if (req.user.role !== 'merchant') {
//     //         req.flash('error', 'You do not have permission to view this page.');
//     //         return res.redirect('/');
//     //     }

//     //     const orders = await Order.find().populate('userId', 'name email');

//     //     res.render('all-orders', {
//     //         title: 'All Orders',
//     //         orders: orders,
//     //     });
//     // } catch (err) {
//     //     console.error(err);
//     //     req.flash('error', 'Error retrieving orders.');
//     //     res.redirect('/');
//     // }
// });
