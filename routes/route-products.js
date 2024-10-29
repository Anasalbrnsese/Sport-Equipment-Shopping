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
        res.render('layout/index', { chunk: chunk });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});


router.post('/createProduct', [
    check('image').notEmpty().withMessage('Image is required'),
    check('title').notEmpty().withMessage('Title is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Pass errors and the original form data back to the template
        return res.render('layout/createProduct', {
            errors: errors.array(),  // Pass the errors to the template
            formData: req.body       // Pass the form data back to pre-fill the form
        });
    }

    let newProduct = new Product({
        imageProduct: req.body.image,
        titleProduct: req.body.title,
        priceProduct: req.body.price,
        descriptionProduct: req.body.description,
    });

    try {
        await newProduct.save();
        console.log("Product was added");
        res.redirect('/product');  // Redirect after successful creation
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving product');  // Handle errors
    }
});



// Route for fetching a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id });  // Use async/await
        if (product) {
            res.render('layout/showProducts', { product: product });  // Make sure the path is correct
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error' + err);  // Handle errors
    }
});

module.exports = router;
