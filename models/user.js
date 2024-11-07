const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // تأكد من أن البريد الإلكتروني فريد
    },
    password: {
        type: String,
        required: function () { return !this.googleId; },
    },
    googleId: { type: String },
    role: {
        type: String,
        enum: ['merchant', 'user'],
        default: 'user' // افتراضيًا سيكون المستخدم العادي
    },
});

// دالة لتشفير كلمة المرور
userSchema.methods.hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// دالة لمقارنة كلمة المرور المُدخلة مع كلمة المرور المُشفرة
userSchema.methods.comparePasswords = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
