const express = require("express");
const router = express.Router();
const Product = require('../models/products');
const { check, validationResult } = require('express-validator');
const Category = require('../models/category');
const { isAdminOrMerchant, isAuthenticated } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// مسار العرض الأولي للمنتجات
router.get('/', async (req, res) => {
    try {
        const filter = {};  // يجب تعريف filter بشكل صحيح هنا

        const products = await Product.find(filter).populate('category');
        let chunk = [];
        let chunkSize = 3; // حجم الشريحة (chunks)

        // تقسيم المنتجات إلى مجموعات
        for (let i = 0; i < products.length; i += chunkSize) {
            chunk.push(products.slice(i, i + chunkSize));
        }

        res.render('layout/index', {
            chunk: chunk,
            categories: await Category.find(), // تمرير الفئات
            categoryId: '', // عدم وجود فئة محددة
            search: '', // إفراغ النص في حقل البحث
            message: req.flash('info'),
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('Error fetching products');
    }
});

// مسار البحث
router.get('/search', async (req, res) => {
    try {
        const search = req.query.search || ''; // النص المدخل في مربع البحث
        const filter = {
            titleProduct: { $regex: search, $options: 'i' }, // البحث بشكل غير حساس لحالة الأحرف
        };

        const products = await Product.find(filter).populate('category');
        let chunk = [];
        let chunkSize = 3;

        // تقسيم المنتجات إلى مجموعات
        for (let i = 0; i < products.length; i += chunkSize) {
            chunk.push(products.slice(i, i + chunkSize));
        }

        const categories = await Category.find();

        res.render('layout/index', {
            chunk: chunk,
            categories: categories,
            categoryId: '', // عدم وجود فئة محددة
            search: search, // الاحتفاظ بالنص المدخل في مربع البحث
            message: req.flash('info'),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching products');
    }
});

// مسار الفئات
router.get('/filter', async (req, res) => {
    try {
        const categoryId = req.query.category || ''; // الفئة المحددة
        const filter = categoryId ? { category: categoryId } : {}; // فلترة بالفئة أو عرض جميع المنتجات

        const products = await Product.find(filter).populate('category');
        let chunk = [];
        let chunkSize = 3;

        // تقسيم المنتجات إلى مجموعات
        for (let i = 0; i < products.length; i += chunkSize) {
            chunk.push(products.slice(i, i + chunkSize));
        }

        const categories = await Category.find();

        res.render('layout/index', {
            chunk: chunk,
            categories: categories,
            categoryId: categoryId, // تحديد الفئة المحددة
            search: '', // إفراغ النص في حقل البحث
            message: req.flash('info'),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching products');
    }
});

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Save files in the 'public/uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Name file uniquely
    }
});

// Check file type
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); // Accept the file
    } else {
        req.flash('errors', [{ msg: 'You need to upload an image (jpeg, jpg, or png).' }]);
        return cb(null, false); // Reject the file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Form for creating product
router.get('/createProduct', isAuthenticated, isAdminOrMerchant, async (req, res) => {
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

// Handle product creation with image upload
router.post('/createProduct', isAdminOrMerchant, upload.single('image'), [
    check('title').notEmpty().withMessage('Title is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        return res.redirect('/product/createProduct');
    }

    if (!req.file) {
        req.flash('errors', [{ msg: 'You need to upload an image.' }]);
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

// Route to render the edit product form
router.get('/edit/:id', isAuthenticated, isAdminOrMerchant, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.find();
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/product');
        }
        res.render('layout/editProduct', {
            product: product,
            categories: categories,
            errors: req.flash('errors'),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching product');
    }
});

// Route to handle product edit submission
router.post('/edit/:id', isAuthenticated, isAdminOrMerchant, upload.single('image'), [
    check('title').notEmpty().withMessage('Title is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('description').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        return res.redirect(`/product/edit/${req.params.id}`);
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/product');
        }

        // Update product details
        product.titleProduct = req.body.title;
        product.priceProduct = req.body.price;
        product.descriptionProduct = req.body.description;
        product.category = req.body.category;

        if (req.file) {
            product.imageProduct = `/uploads/${req.file.filename}`;
        }

        await product.save();
        req.flash('info', 'Product updated successfully');
        res.redirect('/product');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product');
    }
});


// Route to delete a product
router.post('/delete/:id', isAuthenticated, isAdminOrMerchant, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/product');
        }

        await product.deleteOne();
        req.flash('info', 'Product deleted successfully');
        res.redirect('/product');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting product');
    }
});

module.exports = router;
