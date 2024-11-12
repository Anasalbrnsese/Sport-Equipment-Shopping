const express = require("express");
const router = express.Router();
const Product = require('../models/products');
const { check, validationResult } = require('express-validator');
const { error } = require("jquery");
const Category = require('../models/category');


// to check if user is loogged in 
isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    res.redirect('/users/login')
};

isMerchant = (req, res, next) => {
    if (req.user.role === 'merchant') {
        return next();
    }
    req.flash('error', 'ليس لديك الصلاحيات لإضافة منتجات.');
    res.redirect('/product'); // إعادة توجيه المستخدم إلى صفحة المنتجات
};

router.get('/', async (req, res) => {
    try {
        const categoryId = req.query.category;  // Get category from the query string
        const filter = categoryId ? { category: categoryId } : {};  // If category is selected, filter by it

        const products = await Product.find(filter).populate('category');
        let chunk = [];
        let chunkSize = 3;  // Adjust chunk size if needed

        // Create chunks of products
        for (let i = 0; i < products.length; i += chunkSize) {
            chunk.push(products.slice(i, i + chunkSize));  // Create chunks of 3 products each
        }
        // Fetch all categories for the category filter dropdown
        const categories = await Category.find();

        res.render('layout/index', {
            chunk: chunk,
            categories: categories,
            categoryId: categoryId,  // To keep track of selected category
            message: req.flash('info'),
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching products');
    }
});



const multer = require('multer');
const path = require('path');
const { authenticate } = require("passport");
const product = require("../models/products");

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Save files in the 'public/uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Name file uniquely
    }
});

const upload = multer({ storage: storage });

router.get('/createProduct', isAuthenticated, isMerchant, async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories from the database
        res.render('layout/createProduct', {
            categories: categories, // Pass categories to the template
            errors: req.flash('errors'),
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching categories');
    }
});
router.post('/createProduct', upload.single('image'), [
    check('title').notEmpty().withMessage('Title is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        return res.redirect('/product/createProduct');
    }

    let newProduct = new Product({
        imageProduct: `/uploads/${req.file.filename}`, // Save the image path
        titleProduct: req.body.title,
        priceProduct: req.body.price,
        descriptionProduct: req.body.description,
        category: req.body.category,
    });

    try {
        await newProduct.save();
        req.flash('info', 'The Product Was Created successfully');
        res.redirect('/product');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving product');
    }
});


// Route for fetching a single product by ID
router.get('/:id', async (req, res) => {
    if (req.params.id === 'favicon.ico') {
        return res.status(204).end(); // تجاهل طلبات favicon.ico
    }

    try {
        const product = await Product.findOne({ _id: req.params.id });
        const cart = req.session.cart || [];
        if (product) {
            res.render('layout/showProducts', {
                product: product,
                cart: cart,
            });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error: ' + err);
    }
});

module.exports = router;
