const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // To generate unique tokens
const nodemailer = require('nodemailer'); // For sending emails
const dns = require('dns'); // To validate email domain

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to validate email domain
async function isValidDomain(email) {
    const domain = email.split('@')[1];
    return new Promise((resolve) => {
        dns.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

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

// Local strategy for user signup
passport.use('local.signup', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (req.body.password !== req.body.confirm_password) {
        return done(null, false, req.flash('error', 'Passwords do not match.'));
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return done(null, false, req.flash('error', 'Invalid email format.'));
    }

    // Validate email domain
    const isDomainValid = await isValidDomain(email);
    if (!isDomainValid) {
        return done(null, false, req.flash('error', 'Email domain is invalid.'));
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return done(null, false, req.flash('error', 'Email is already registered.'));
        }

        // Generate a magic link token and expiration
        const magicToken = crypto.randomBytes(32).toString('hex');
        const magicTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        const newUser = new User();
        newUser.name = req.body.name;
        newUser.email = email;
        newUser.password = await bcrypt.hash(req.body.password, 10); // Save hashed password
        newUser.role = req.body.role || 'user';
        newUser.avatar = "default-avatar.png";
        newUser.magicToken = magicToken;
        newUser.magicTokenExpiry = magicTokenExpiry;
        newUser.isVerified = false;

        await newUser.save();

        // Send magic link via email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const magicLink = `${req.protocol}://${req.get('host')}/users/auth/verify/${magicToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: newUser.email,
            subject: 'Verify your account',
            text: `Click the following link to verify your account: ${magicLink}`,
            html: `<p>Click the following link to verify your account:</p><a href="${magicLink}">Verify your email.</a>`
        };

        await transporter.sendMail(mailOptions);

        return done(null, false, req.flash('success', 'A verification link has been sent to your email.'));
    } catch (err) {
        return done(err); // Handle any errors
    }
}));

// Local strategy for user login
passport.use('local.login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        // Validate the password field
        if (!password) {
            return done(null, false, req.flash('error', 'Password is required.'));
        }

        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return done(null, false, req.flash('error', 'Email or Password is wrong.'));
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return done(null, false, req.flash('error', 'Please verify your email first.'));
        }

        // Ensure the user has a password
        if (!user.password) {
            return done(null, false, req.flash('error', 'This account does not have a password. Please use Google login.'));
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user, req.flash('success', 'Welcome back.'));
        } else {
            return done(null, false, req.flash('error', 'Email or Password is wrong.'));
        }
    } catch (err) {
        console.error("Error in login strategy:", err);
        return done(null, false, req.flash('error', 'Something went wrong.'));
    }
}));

// // Google OAuth 2.0 Strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/users/auth/google/callback",
//     scope: ['openid', 'profile', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         // Check if the user exists based on googleId
//         let user = await User.findOne({ googleId: profile.id });

//         if (user) {
//             return done(null, user);
//         }

//         // Check if the user exists based on the email
//         user = await User.findOne({ email: profile.emails[0].value });

//         if (user) {
//             // Add googleId to the user
//             user.googleId = profile.id;
//             await user.save();
//             return done(null, user);
//         }

//         // Create a new user if not found
//         user = new User({
//             googleId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             avatar: profile.photos ? profile.photos[0].value : 'default-avatar.png',
//             isVerified: true // Automatically verified if signing in via Google
//         });

//         await user.save();
//         return done(null, user);

//     } catch (err) {
//         return done(err, null);
//     }
// }));

module.exports = passport;
