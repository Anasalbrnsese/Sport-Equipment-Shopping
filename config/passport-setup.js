const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

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

// Local strategy for signup
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

        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.password = newUser.hashPassword(req.body.password);
        newUser.role = req.body.role || 'user';

        const savedUser = await newUser.save();
        return done(null, savedUser, req.flash('success', 'Account created successfully!'));
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
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, req.flash('error', 'Email or Password is Wrong'));
        }

        if (user.comparePasswords(password, user.password)) {
            return done(null, user, req.flash('success', 'Welcome back'));
        }
        else {
            return done(null, false, req.flash('error', 'Email or Password is Wrong!'));
        }
    } catch (err) {
        return done(null, false, req.flash('error', 'Something wrong happened'));
    }
}));

// إعداد Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/users/auth/google/callback",
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
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        // إنشاء مستخدم جديد إذا لم يكن موجودًا مسبقًا
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: ''
        });
        await user.save();
        return done(null, user);

    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;
