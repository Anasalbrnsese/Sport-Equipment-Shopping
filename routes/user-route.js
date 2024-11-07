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
router.post('/login', (req, res, next) => {
    passport.authenticate('local.login', (err, user, info) => {
        if (err) return next(err); // إذا حدث خطأ في المصادقة

        if (!user) {
            req.flash('error','Invalid login credentials');  
            return res.redirect('/users/login');
        }

        // إذا كانت المصادقة ناجحة
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash('success', 'Login successfully!');  
            return res.redirect('/users/profile');
        });
    })(req, res, next);
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
    const activationCodeRequired = process.env.ACTIVATION_CODE_MERCHANT; // Replace with your activation code

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordPattern.test(password)) {
        req.flash('error', 'Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, a number, and a special character.');
        return res.redirect('/users/signup');
    }

    if (role === 'merchant') {
        if (!activationCode) {
            req.flash('error', 'You must enter an activation code to register as a merchant.');
            return res.redirect('/users/signup');
        } else if (activationCode !== activationCodeRequired) {
            req.flash('error', 'You do not have permission to create a merchant account. Please check the activation code.');
            return res.redirect('/users/signup');
        }
    } else {
        if (activationCode) {
            req.flash('error', 'The activation code cannot be used when registering as a user.');
            return res.redirect('/users/signup');
        }
    }
    if (!name || !email || !password || !confirm_password) {
        req.flash('error', 'Missing credentials');
    }


    passport.authenticate('local.signup', {
        failureRedirect: '/users/signup',
        failureFlash: true
    }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/users/signup');
        }

        req.flash('success', 'Account created successfully! You can now login.');
        return res.redirect('/users/login');
    })(req, res, next);
});

// الملف الشخصي
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const user = await User.findById(userId);

        res.render('user/profile', {
            User: user,
            success: req.flash('success'),
            error: req.flash('error')
        });
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


// بدء المصادقة مع Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// التعامل مع إعادة التوجيه بعد المصادقة
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/users/login', failureFlash: true }),
    (req, res) => {
        req.flash('success', 'Successfully logged in via Google. Welcome to our platform!');
        res.redirect('/users/profile');
    });


module.exports = router;
