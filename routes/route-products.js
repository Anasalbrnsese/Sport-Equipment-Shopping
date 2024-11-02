const express = require("express");
const router = express.Router();
const Product = require('../models/products');  // Ensure correct capitalization
const { check, validationResult } = require('express-validator');
const { error } = require("jquery");

// Route for fetching and displaying all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});  // Fetch products from the database
        let chunk = [];
        let chunkSize = 3;  // Adjust chunk size if needed

        // Loop through products and create chunks
        for (let i = 0; i < products.length; i += chunkSize) {
            chunk.push(products.slice(i, i + chunkSize));
        }
        res.render('layout/index', {
            chunk: chunk,
            message: req.flash('info'),
            success: req.flash('success')
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});


const multer = require('multer');
const path = require('path');

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

router.get('/createProduct', (req, res) => {
    res.render('layout/createProduct', {
        errors: req.flash('errors')
    });
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
        if (product) {
            res.render('layout/showProducts', { product: product });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error: ' + err);
    }
});

module.exports = router;
