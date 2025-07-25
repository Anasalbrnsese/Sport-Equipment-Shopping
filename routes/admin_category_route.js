const express = require("express");
const router = express.Router();
const Category = require('../models/category');
const { isAdminOrMerchant } = require('../middlewares/auth');
const Product = require('../models/products');

router.get('/', isAdminOrMerchant, async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('admin/categories', {
            categories: categories
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Route to render the Add Category form
router.get('/add-category', isAdminOrMerchant, async (req, res) => {
    res.render('admin/add_category', {
        title: '', // Default empty values for form fields
        slug: '',
        content: ''
    });
});

// Route to handle form submission
router.post('/add-category', isAdminOrMerchant, async (req, res) => {
    try {
        const { title, slug, content } = req.body;

        // Save the new category in the database
        const newCategory = new Category({
            title,
            slug: slug || title.toLowerCase().replace(/ /g, '-'), // If no slug is provided, generate one
            description: content
        });

        await newCategory.save();
        req.flash('success', 'Category added successfully.');
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});// Route to handle deleting a category
router.get('/delete-category/:id', isAdminOrMerchant, async (req, res) => {
    try {
        // Check if there are products linked to the category
        const products = await Product.find({ category: req.params.id });
        if (products.length > 0) {
            // Add an error flash message and redirect
            req.flash('error', 'Cannot delete category: Products are associated with this category.');
            return res.redirect('/admin/categories');
        }

        // Find the category by ID and delete it
        await Category.findByIdAndDelete(req.params.id);

        // Add a success flash message and redirect
        req.flash('success', 'Category deleted successfully.');
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Server error. Please try again.');
        res.redirect('/admin/categories');
    }
});

// Route to render the Edit Category form
router.get('/edit-category/:slug', isAdminOrMerchant, async (req, res) => {
    try {
        // Find the category by slug
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).send("Category not found");
        }

        // Render the form with the current category details
        res.render('admin/edit_category', {
            category: category,
            title: category.title,
            slug: category.slug,
            content: category.description
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Route to handle updating the category
router.post('/edit-category/:slug', isAdminOrMerchant, async (req, res) => {
    try {
        const { title, slug, content } = req.body;

        // Update the category based on the slug
        const updatedCategory = await Category.findOneAndUpdate(
            { slug: req.params.slug },
            { title, slug, description: content },
            { new: true } // To return the updated document
        );
        await updatedCategory.save();
        req.flash('success', 'Category updated successfully.');
        // Redirect to the categories page after updating
        res.redirect('/admin/categories');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


module.exports = router;
