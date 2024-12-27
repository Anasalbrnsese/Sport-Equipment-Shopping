require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const routeProduct = require('./routes/route-products');
const adminCategories = require('./routes/admin_category_route');
const cart = require('./routes/cart-route');
const orders = require('./routes/order-route');
const users = require('./routes/user-route');
const { connect } = require('mongoose');
const app = express();
require('./config/database');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const favicon = require('serve-favicon');
const path = require('path');
const feedbackRoutes = require('./routes/feedback');
const adminDashboardRoute = require('./routes/admin-dashboard');
const infoAARRoutes = require('./routes/infoAAR');
const mongodbStore = new mongodbSession({
    uri: 'mongodb://localhost:27017/productdb',
    collection: 'sessions',
    expiresIn: 60000 * 15
})

// session and flach config
app.use(session({
    secret: 'lorem ipsum',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 15 },
    store: mongodbStore
}));

app.use(flash());


//bring passport 
app.use(passport.initialize());
app.use(passport.session());

app.use('*', async (req, res, next) => {
    res.locals.User = req.user || null;
    next();
});

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});




app.use((req, res, next) => {
    res.locals.cart = req.session.cart || []; // إذا كانت السلة غير موجودة، عرّفها كقائمة فارغة
    next();
});


// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');  // Fix path for views




// Serve static files
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('node_modules'));




// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));




// Use the products router for /product route
app.use('/product', routeProduct);
app.use('/cart', cart);
app.use('/', routeProduct);
app.use('/admin/categories', adminCategories);
app.use('/orders', orders);
app.use('/users', users);
app.use('/feedback', feedbackRoutes);
app.use('/admin', adminDashboardRoute);
app.use("/infoAAR", infoAARRoutes); 

app.use(favicon(path.join(__dirname, 'public', 'favicon', 'favicon.ico')));
app.use((req, res, next) => {
    if (req.url === '/favicon/favicon.ico' || '/favicon/profile.jpg') {
        return res.status(204).end(); // إرسال استجابة بدون محتوى لطلبات الأيقونة
    }
    next();
});





 

// Start the server
app.listen(3000, function () {
    console.log("Running on port 3000.");
});
