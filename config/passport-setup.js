const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // To generate unique tokens
const nodemailer = require('nodemailer'); // For sending emails


// Serialize user instance to the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store the user ID in the session
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // Pass the user to the request object
    } catch (err) {
        done(err); // Handle error if user is not found
    }
});


passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (req.body.password !== req.body.confirm_password) {
        return done(null, false, req.flash('error', 'Passwords do not match'));
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return done(null, false, req.flash('error', 'Email is already registered'));
        }

        // Generate a magic link token and expiration
        const magicToken = crypto.randomBytes(32).toString('hex');
        const magicTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = newUser.hashPassword(req.body.password); // Save hashed password (optional)
        newUser.role = req.body.role || 'user';
        newUser.avatar = "default-avatar.png";
        newUser.magicToken = magicToken;
        newUser.magicTokenExpiry = magicTokenExpiry;
        newUser.isVerified = false; // User is not verified yet

        await newUser.save();

        // Send magic link via email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
            port: process.env.EMAIL_PORT, // e.g., 587
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS  // your email password or app-specific password
            }
        });

        const magicLink = `${req.protocol}://${req.get('host')}/users/auth/verify/${magicToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Verify your account',
            text: `Click the following link to verify your account: ${magicLink}`,
            html: `<p>Click the following link to verify your account:</p><a href="${magicLink}">click here to verify your email.</a>`
        };

        await transporter.sendMail(mailOptions);

        return done(null, false, req.flash('success', 'A verification link has been sent to your email.'));
    } catch (err) {
        return done(err); // Handle any errors
    }
}));

// Local strategy for login
passport.use('local.login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, req.flash('error', 'Email or Password is Wrong'));
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user, req.flash('success', 'Welcome back'));
        } else {
            return done(null, false, req.flash('error', 'Email or Password is Wrong!'));
        }
    } catch (err) {
        console.error("Error in login strategy:", err);
        return done(null, false, req.flash('error', 'Something wrong happened'));
    }
}));


// إعداد Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/users/auth/google/callback",
    scope: ['openid', 'profile', 'email'] // النطاقات المطلوبة
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // تحقق ما إذا كان المستخدم موجودًا بناءً على googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }

        // تحقق بناءً على البريد الإلكتروني إذا كان المستخدم موجودًا
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // إذا كان المستخدم موجودًا، قم بإضافة googleId
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        // إنشاء مستخدم جديد إذا لم يكن موجودًا مسبقًا
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos ? profile.photos[0].value : 'default-avatar.png', // إضافة صورة للملف الشخصي إذا كانت موجودة
        });

        // تجاوز التحقق من كلمة المرور في حال كان تسجيل الدخول عبر Google
        user.validateBeforeSave = false; // تعطيل التحقق قبل الحفظ إذا لم تكن هناك كلمة مرور
        await user.save();
        return done(null, user);

    } catch (err) {
        return done(err, null); // إرجاع الخطأ في حال حدوثه
    }
}));

module.exports = passport;
