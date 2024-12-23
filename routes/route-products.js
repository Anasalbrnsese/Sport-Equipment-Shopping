const express = require("express");
const router = express.Router();
const Product = require('../models/products');
const { check, validationResult } = require('express-validator');
const { error } = require("jquery");
const Category = require('../models/category');
const Order = require('../models/order'); // Adjust the path as needed


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



const multer = require('multer');
const path = require('path');
const { authenticate } = require("passport");


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


// Route to render the edit product form
router.get('/edit/:id', isAuthenticated, isMerchant, async (req, res) => {
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
router.post('/edit/:id', upload.single('image'), [
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
router.post('/delete/:id', isAuthenticated, isMerchant, async (req, res) => {
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
