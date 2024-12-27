const express = require("express");
const router = express.Router();

// Route for Contact page
router.get('/contact', (req, res) => {
    res.render('infoAAR/contact');
});
router.get('/services', (req, res) => {
    res.render('infoAAR/services');
});
router.get('/about', (req, res) => {
    res.render('infoAAR/about');
});

module.exports = router;
