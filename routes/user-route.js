const express = require("express");
const router = express.Router();
const User = require('../models/user');
const { model } = require("mongoose");


//login user view

router.get('/login', (req, res) => {
    res.render('user/login')
});

router.post('/login', (req, res) => {
    console.log(req.body)
    res.json('login in user ...')
});

// sign up form
router.get('/signup', (req, res) => {
    res.render('user/signup')
});

router.post('/signup', (req, res) => {
    console.log(req.body);
    res.json('register in user ...')
});

//profile 
router.get('/profile', (req, res) => {
    res.render('user/profile')
});

//logout
router.get('/logout', (req, res) => {
    res.json('logout user ..')
});

module.exports = router;