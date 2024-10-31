const express = require('express');
const bodyParser = require("body-parser");
const router = require('./routes/route-products');
const app = express();
const db = require('./config/database');
const session = require('express-session');
const flash = require('connect-flash');


// session and flach config
app.use(session({
    secret: 'lorem ipsum',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 * 15 }
}));
app.use(flash());
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
app.use('/product', router);


app.get('/login', (req, res) => {
    res.render('layout/login');
});

app.get('/createProduct', (req, res) => {
    res.render('layout/createProduct', {
    });
});



// Start the server
app.listen(3000, function () {
    console.log("Running on port 3000.");
});
