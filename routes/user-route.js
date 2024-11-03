const express = require("express");
const router = express.Router();
const User = require('../models/user');
const { model } = require("mongoose");
const passport = require('passport');
const { error } = require("jquery");

// to check if user is loogged in 
isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next()
    res.redirect('/users/login')
}


// login user view
router.get('/login', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success'),
        
    });
});

router.post('/login',
    passport.authenticate('local.login', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res) => {
        req.flash('success', 'Login successfully!');
    });

// sign up form
router.get('/signup', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success'),
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
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        // الحصول على معرّف المستخدم من الجلسة أو `null` إذا لم يكن مسجلاً
        const userId = req.user ? req.user.id : null;
        // البحث عن المستخدم باستخدام `async/await` بدلاً من `callback`
        const user = await User.findById(userId);

        // تمرير بيانات المستخدم إلى صفحة `user/profile.ejs`
        res.render('user/profile', { User: user });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في الخادم");
    }
});


// logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/users/login');
    });
});

module.exports = router;