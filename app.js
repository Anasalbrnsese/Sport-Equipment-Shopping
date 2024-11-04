const express = require('express');
const bodyParser = require("body-parser");
const routeProduct = require('./routes/route-products');
const app = express();
const db = require('./config/database');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
const favicon = require('serve-favicon');
const path = require('path');


// session and flach config
app.use(session({
    secret: 'lorem ipsum',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 15 }
}));

app.use(flash());


//bring passport 
app.use(passport.initialize());
app.use(passport.session());

app.use('*', async (req, res, next) => {
    res.locals.User = req.user || null;
    next();
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');  // Fix path for views

// Serve static files
app.use(express.static('public'));
app.use(express.static('node_modules'));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// Use the products router for /product route
app.use('/product', routeProduct);
app.use('/', routeProduct);
// bring user routes
const users = require('./routes/user-route');
const { connect } = require('mongoose');
app.use('/users', users);



//bring icon image with path ico
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
