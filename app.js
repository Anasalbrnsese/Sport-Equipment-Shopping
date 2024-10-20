const express = require('express');
const bodyParser = require("body-parser");
const router = require('./routes/products');
const app = express();
const db = require('./config/database');

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/view');  // Fix path for views

// Serve static files
app.use(express.static('public'));
app.use(express.static('node_modules'));

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Root route to render a home page
app.get('/', (req, res) => {
    // Render an 'index' view from the views folder
    res.render('./products/index');  // Ensure you have a views/index.ejs file
});

// Use the products router for /product route
app.use('/product', router);

// Start the server
app.listen(3000, function () {
    console.log("Running on port 3000.");
});
