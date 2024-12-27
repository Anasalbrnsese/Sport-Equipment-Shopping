module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Unauthorized access.');
    res.redirect('/');
};

module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in to be able to access the site features ');
    res.redirect('/users/login');
};

module.exports.isAdminOrMerchant = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'merchant' || req.user.role === 'admin')) {
        return next();
    }
    req.flash('error', 'You do not have permissions to do action ');
    res.redirect('/');
};