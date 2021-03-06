var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var user = require('../controllers/user');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
    res.render('user/profile');
});

router.get('/logout', isLoggedIn, user.logout);


router.use('/', isLoggedIn, function(req, res, next) {
    next();
});

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/signin', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local.signin', {
        failureRedirect: '/user/signin',
        failureFlash: true
    }),
    function(req, res) {
        if (req.user.roles == 'USER') {
            res.redirect('/profile');
        } else if (req.user.roles == 'ADMIN') {
            res.redirect('/admin');
        } else if (req.user.roles == 'SUPERADMIN') {
            res.redirect('/admin');
        } else {
            res.redirect('/user/signin');
        }
    }

);


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || req.path == '/signin' || req.path == '/signup') {
        return next();
    }
    res.redirect('/user/signin');
}