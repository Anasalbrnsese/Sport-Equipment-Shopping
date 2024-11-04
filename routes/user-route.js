const express = require("express");
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// للتحقق مما إذا كان المستخدم مسجلاً
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/users/login');
};

// عرض تسجيل الدخول
router.get('/login', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success'),
    });
});

// تسجيل الدخول
router.post('/login',
    passport.authenticate('local.login', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res) => {
        req.flash('success', 'Login successfully!');
    });

// عرض نموذج التسجيل
router.get('/signup', (req, res) => {
    res.render('user/login', {
        error: req.flash('error'),
        success: req.flash('success'),
    });
});

// تسجيل المستخدم
router.post('/signup', async (req, res, next) => {
    const { name, email, password, confirm_password, role, activationCode } = req.body;

    // تحقق من إدخال كود التفعيل عند اختيار "تاجر"
    const activationCodeRequired = 'ADFA2DSNM!23D@$FDAJ3IAD'; // استبدل بكود التفعيل الخاص بك
    if (role === 'merchant') {
        if (!activationCode) {
            req.flash('error', 'يجب إدخال كود التفعيل لتسجيل كـ تاجر.');
            return res.redirect('/users/signup');
        } else if (activationCode !== activationCodeRequired) {
            req.flash('error', 'ليس لديك الصلاحيات لإنشاء حساب تاجر. تحقق من كود التفعيل.');
            return res.redirect('/users/signup');
        }
    } else {
        // تحقق مما إذا كان المستخدم يحاول التسجيل كـ "مستخدم" مع إدخال كود التفعيل
        if (activationCode) {
            req.flash('error', 'لا يمكن استخدام كود التفعيل عند التسجيل كـ مستخدم.');
            return res.redirect('/users/signup');
        }
    }

    // استخدم Passport لتسجيل المستخدم
    passport.authenticate('local.signup', {
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

    req.flash('success', 'Account created successfully! You can now sign in.');
    res.redirect('/users/login');
});

// الملف الشخصي
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const user = await User.findById(userId);

        res.render('user/profile', { User: user });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في الخادم");
    }
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/users/login');
    });
});

module.exports = router;
