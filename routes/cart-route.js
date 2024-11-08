const express = require("express");
const router = express.Router();
const Product = require('../models/products');
const { error } = require("jquery");


let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'Must login to add cart');
    res.redirect('/users/login');
};


router.post('/add_cart', isAuthenticated, (req, res) => {
    const { product_id, imageProduct, product_name, product_price } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    let productExists = false;

    // تحديث الكمية إذا كان المنتج موجودًا في السلة
    req.session.cart.forEach(item => {
        if (item.product_id === product_id) {
            item.quantity += 1;
            productExists = true;
        }
    });

    // إضافة المنتج إذا لم يكن موجودًا في السلة
    if (!productExists) {
        req.session.cart.push({
            product_id,
            product_name,
            product_price: parseFloat(product_price),
            imageProduct,
            quantity: 1
        });
    }  
    res.redirect('/product')
});

router.get('/remove_item', (req, res) => {
    const product_id = req.query.id;

    req.session.cart = req.session.cart.filter(item => item.product_id !== product_id);

    res.redirect('/cart');
});

router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    res.render('layout/cart', { cart: cart });
});

// product routes
router.get('/remove_item', (req, res) => {
    const product_id = req.query.id;

    req.session.cart = req.session.cart.filter(item => item.product_id !== product_id);

    res.redirect('/product/cart');
});


router.get('/increase', (req, res) => {
    const productId = req.query.id;
    const cart = req.session.cart || [];

    // Find the item and increase its quantity
    const item = cart.find(p => p.product_id === productId);
    if (item) item.quantity += 1;

    res.redirect('/cart');
});


router.get('/decrease', (req, res) => {
    const productId = req.query.id;
    const cart = req.session.cart || [];

    // Find the item and decrease its quantity (minimum 1)
    const item = cart.find(p => p.product_id === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
    } else if (item && item.quantity === 1) {
        // Optionally, remove the item if quantity is 1
        req.session.cart = cart.filter(p => p.product_id !== productId);
    }

    res.redirect('/cart');
});


module.exports = router;
