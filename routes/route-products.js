const express = require("express");
const router = express.Router();
const Product = require('../models/products');  // Ensure correct capitalization

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

        // Render the view and pass the product chunks to the template
        res.render('layout/index', { chunk: chunk });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');  // Handle errors
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
        res.status(500).send('Server error');  // Handle errors
    }
});

module.exports = router;
