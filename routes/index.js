var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sampleapp1891@gmail.com',
        pass: 'Papaisgreat1@'
    }
});
router.get('/', function (req, res) {
    res.redirect('/login');
});
router.get('/login', function (req, res, next) {
    res.render('login.html', {
        title: "Login"
    });
});
router.get('/register', function (req, res, next) {
    res.render('register.html', {
        title: "Register"
    });
});
router.get('/reset', function (req, res, next) {
    res.render('reset.html', {
        title: "reset"
    });
});
/* POST API for Register User. */
router.post('/register', function (req, res, next) {
    var usersDB = req.users;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    var incryptPassword = '';
    var validEmail = false;
    var algorithm = 'aes-256-ctr',
            predefinedPassword = 'd6F3Efeq';
    if (password !== cpassword) {
        req.json_op_status = 0;
        req.json_op_message = 'Password does not match';
        next();
    }

    if (password) {
        var cipher = crypto.createCipher(algorithm, predefinedPassword);
        var incryptPassword = cipher.update(password, 'utf8', 'hex');
        incryptPassword += cipher.final('hex');
    } else {
        req.json_op_status = 0;
        req.json_op_message = 'Password required';
        next();
    }

    function validateEmail(email) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }

    if (email) {
        validEmail = validateEmail(email);
    }

    if (!validEmail) {
        req.json_op_status = 0;
        req.json_op_message = 'Invaild Email';
        next();
    }

    if (name && email && password) {
        usersDB.findOne({
            email: email
        }, function (error, records) {
            if (error) {
                req.json_op_status = 0;
                req.json_op_message = error;
                next();
            } else if (!records) {
                var record = new usersDB({
                    name: name,
                    email: email,
                    password: incryptPassword
                });
                record.save(function (err) {
                    if (err) {
                        req.json_op_status = 0;
                        req.json_op_message = err;
                        next();
                    } else {
                        res.render('welcome.html', {
                            title: "Welcome"
                        });
                    }
                });
            } else {
                req.json_op_status = 0;
                req.json_op_message = 'User already registered';
                next();
            }
        });
    } else {
        req.json_op_status = 0;
        req.json_op_message = 'Fill all fields.';
        next();
    }
});

/* POST API for Login User. */
router.post('/login', function (req, res, next) {
    var usersDB = req.users;
    var email = req.body.email;
    var password = req.body.password;
    var incryptPassword = '';
    var algorithm = 'aes-256-ctr',
            predefinedPassword = 'd6F3Efeq';
    if (password) {
        var cipher = crypto.createCipher(algorithm, predefinedPassword);
        var incryptPassword = cipher.update(password, 'utf8', 'hex');
        incryptPassword += cipher.final('hex');
    } else {
        req.json_op_status = 0;
        req.json_op_message = 'Password can not be blank';
        next();
    }
    if (email && password) {
        usersDB.findOne({
            email: email,
            password: incryptPassword
        }, function (error, records) {
            if (error) {
                req.json_op_status = 0;
                req.json_op_message = error;
                next();
            } else if (records) {
                res.render('welcome.html', {
                    title: "Welcome"
                });
            } else {
                req.json_op_status = 0;
                req.json_op_message = 'Invalid Credentails.';
                next();
            }
        });
    } else {
        req.json_op_status = 0;
        req.json_op_message = 'Fill all fields';
        next();
    }
});

/* POST API for Reset Password for User. */
router.post('/reset', function (req, res, next) {
    var algorithm = 'aes-256-ctr',
            predefinedPassword = 'd6F3Efeq';
    var usersDB = req.users;
    var email = req.body.email;
    if (email) {
        usersDB.findOne({
            email: email
        }, function (err, result) {
            if (err) {
                req.json_op_status = 0;
                req.json_op_message = err;
                next();
            } else if (result) {
                var decPassword = result.password;
                var decipher = crypto.createDecipher(algorithm, predefinedPassword);
                var dec = decipher.update(decPassword, 'hex', 'utf8');
                dec += decipher.final('utf8');
                let mailOptions = {
                    from: 'sampleapp1891@gmail.com',
                    to: email,
                    subject: 'New Password',
                    text: 'Your Password is : ' + dec + '.',
                    html: '<h3>Your Password is : ' + dec + '.</h3>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        req.json_op_status = 0;
                        req.json_op_message = error;
                        next();
                    }
                    req.json_op_status = 1;
                    req.json_op_message = 'Check your mail account.';
                    next();
                });
            } else {
                req.json_op_status = 0;
                req.json_op_message = 'User does not exist';
                next();
            }
        });
    } else {
        req.json_op_status = 0;
        req.json_op_message = 'Email can not be blank';
        next();
    }
});
module.exports = router;