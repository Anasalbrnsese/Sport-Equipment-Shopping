const express = require("express");
const router = express.Router();
const User = require('../models/user');
const { model } = require("mongoose");
const passport = require('passport');
const { error } = require("jquery");


// login user view
router.get('/login', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/login',
    passport.authenticate('local.login', {
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res) => {
        req.flash('success', 'Login successfully!');
        res.redirect('/product');
    });

// sign up form
router.get('/signup', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success')
    })
});

router.post('/signup',
    passport.authenticate('local.signup', {
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res) => {
        req.flash('success', 'Account created successfully! You can now sign in.');
        res.redirect('/users/login');
    });

// profile
router.get('/profile', (req, res) => {
    res.render('user/profile');
});

// logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/users/login');
    });
});

module.exports = router;