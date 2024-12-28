const express = require("express");
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const multer = require("multer");
const bcrypt = require('bcrypt');
const Joi = require('joi');


//configure multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
});

var upload = multer({ storage: storage });


// للتحقق مما إذا كان المستخدم مسجلاً
const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', "unauthorized access");
        return res.redirect('/users/login')
    }
    if (!req.user.isVerified) {

        req.flash('error', "you need to sign up in first and verify your account");
        return res.redirect('/users/login')
    }
    next()
};

// عرض تسجيل الدخول
router.get('/login', (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0;
    res.render('user/login', {
        cartCount: cartCount, // تمرير المتغير إلى الـ profile.ejs
        User: req.user // تمرير بيانات المستخدم إذا كانت موجودة
    });
});

// تسجيل الدخول
router.post('/login', (req, res, next) => {
    passport.authenticate('local.login', async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            req.flash('error', 'Invalid login credentials');
            return res.redirect('/users/login');
        }

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                const userFromDb = await User.findById(user._id);

                req.flash('success', 'Login successfully!');
                return res.redirect('/users/profile');
            } catch (err) {
                console.log(err);
                req.flash('error', 'Error retrieving cart');
                return res.redirect('/users/login');
            }
        });
    })(req, res, next);
});



// عرض نموذج التسجيل
router.get('/signup', (req, res) => {
    res.render('user/login', {

    });

});

// تسجيل المستخدم
router.post('/signup', async (req, res, next) => {
    const { name, email, password, confirm_password, role, activationCode } = req.body;
    const activationCodeRequired = process.env.ACTIVATION_CODE_MERCHANT;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!name || !email || !password || !confirm_password) {
        req.flash('error', 'Missing credentials');
    }
    else if (!passwordPattern.test(password)) {
        req.flash('error', 'Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, a number, and a special character.');
        return res.redirect('/users/signup');
    }

    else if (role === 'merchant') {
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



router.get('/auth/verify/:token', async (req, res) => {
    const token = req.params.token;

    try {
        const user = await User.findOne({ magicToken: token, magicTokenExpiry: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Invalid or expired token');
            return res.redirect('/signup');
        }

        user.magicToken = undefined; // Clear the token
        user.magicTokenExpiry = undefined; // Clear the expiry
        user.isVerified = true; // Mark the user as verified

        await user.save();

        req.flash('success', 'Your account has been verified. You can now log in.');
        res.redirect('/users/login');
    } catch (err) {
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/users/signup');
    }
});

// الملف الشخصي
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const userId = req.user ? req.user.id : null;
        const user = await User.findById(userId);
        res.render('user/profile', {
            User: user,
            cartCount: cartCount, // تمرير المتغير إلى الـ profile.ejs
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في الخادم");
    }
});



router.post('/updatePhone', (req, res) => {
    const userId = req.user._id;  // Get the user ID from the session or token
    const { phone } = req.body;   // Get the new phone number from the form

    // Define a validation schema for the phone number
    const phoneSchema = Joi.string().pattern(/^(\+9627\d{8})$/).message('Invalid Jordanian phone number');

    // Validate the phone number format
    const { error } = phoneSchema.validate(phone);

    if (error) {
        req.flash('error', 'Please enter a valid Jordanian phone number (e.g., +9627XXXXXXXX).');
        return res.redirect('/users/profile');  // Redirect to the settings page if validation fails
    }

    // If phone number is valid, update the user
    User.findByIdAndUpdate(userId, { phone }, { new: true })
        .then(updatedUser => {
            req.flash('success', 'Phone number updated successfully!');
            res.redirect('/users/profile');  // Redirect to the settings page after update
        })
        .catch(err => {
            req.flash('error', 'An error occurred while updating the phone number.');
            res.redirect('/users/profile');
        });
});

router.post('/changePassword', isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        // استرجاع المستخدم من قاعدة البيانات
        const user = await User.findById(req.user._id);  // Initialize user first

        // تحقق مما إذا كان المستخدم قد سجل دخوله باستخدام جوجل
        if (user && user.googleId) {
            req.flash('error', 'You cannot change your password when logged in with Google.');
            return res.redirect('/users/profile');
        }

        // التحقق من المدخلات
        if (!currentPassword || !newPassword || !confirmPassword) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/users/profile');
        }

        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match.');
            return res.redirect('/users/profile');
        }

        // التحقق من تنسيق كلمة المرور الجديدة
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordPattern.test(newPassword)) {
            req.flash('error', 'Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, a number, and a special character.');
            return res.redirect('/users/profile');
        }

        // إذا كان المستخدم لم يسجل دخوله عبر جوجل، تحقق من كلمة المرور الحالية
        if (user && !user.googleId) {
            if (!currentPassword) {
                req.flash('error', 'Current password is required.');
                return res.redirect('/users/profile');
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                req.flash('error', 'Current password is incorrect.');
                return res.redirect('/users/profile');
            }
        }

        // تشفير كلمة المرور الجديدة
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // تحديث كلمة مرور المستخدم في قاعدة البيانات
        user.password = hashedPassword;
        await user.save();

        req.flash('success', 'Password changed successfully!');
        res.redirect('/users/profile');

    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while changing the password. Please try again later.');
        res.redirect('/users/profile');
    }
});



// Upload user avatar
router.post('/uploadAvatar', upload.single('avatar'), async (req, res) => {
    try {
        // تحقق من وجود الملف
        if (!req.file) {
            req.flash('error', 'No file uploaded.');
            return res.redirect('/users/profile');
        }

        // إذا تم رفع الملف بنجاح
        let newFields = {
            avatar: req.file.filename,
        };

        await User.updateOne({ _id: req.user._id }, newFields);

        req.flash('success', 'Avatar uploaded successfully!');
        res.redirect('/users/profile');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error uploading avatar.');
        res.redirect('/users/profile');
    }
});





// تسجيل الخروج
router.get('/logout', async (req, res) => {
    if (req.session.cart && req.user) {
        try {
            const userFromDb = await User.findById(req.user._id);

            // // إذا كانت السلة تحتوي على منتجات، نقوم بتخزينها في قاعدة البيانات
            // if (req.session.cart.length > 0) {
            //     console.log('Saving cart:', req.session.cart);
            //     userFromDb.cart = req.session.cart;
            //     await userFromDb.save();
            // }

            // مسح السلة من الجلسة
            req.session.cart = [];
            req.session.orderConfirmed = false; // Reset the orderConfirmed flag to prevent saving cart


        } catch (err) {
            console.log('Error saving cart during logout:', err);
            req.flash('error', 'Error saving your cart.');
        }
    }

    // تسجيل الخروج
    req.logout(() => {
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/users/login');
    });
});


module.exports = router;
