let express = require('express');
let router = express.Router();
let  User = require('../models/user');
let bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login System',  success: req.session.success, errors: req.session.errors, messages: req.flash('error')  });
  req.session.errors = null;
//  req.session.success = null;

});

router.post('/submit', function (req, res, next) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  let Cpassword = req.body.Cpassword;

  req.checkBody('name', 'Name  is required').isAlpha().withMessage('Must be only alphabetical chars')
  .isLength({ min: 4 }).withMessage('Must be at least 10 chars long');
  req.checkBody('email', 'Invalid email').isEmail();
  req.checkBody('password', 'password is required').isLength({min:4}).equals(Cpassword).withMessage('Password mismatch');
  
  let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
        res.redirect('/');
  }else {
        // Make sure this account doesn't already exist
        User.findOne({ email: req.body.email }, function (err, user) {
            // Make sure user doesn't already exist
            if (user) {
                req.session.message = {
                    type: 'danger',
                    intro: '',
                    message: 'User already exist'
                }
                    res.location('/');
                    res.redirect('/');

            }else  {
                //Creating new user
                  let newUser = new User({
                    name: name,
                    email: email,
                    password: password
                });

                User.createUser(newUser, function (err, user) {
                    if (err) throw err;
                    console.log(user);
                });

                //success message
                req.session.message = {
                    type: 'success',
                    intro: '',
                    message: 'Registration successfully'
                }
                res.location('/');
                res.redirect('/');
            }
        });
    };

});


/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login System',  success: req.session.success, errors: req.session.errors  });
  req.session.errors = null;
//  req.session.success = null;

});

/* GET Auth page. */
router.get('/member', function(req, res, next) {
  res.render('member', { title: 'Member Area', success: req.session.success, errors: req.session.errors  });
});

// Route Middleware
function isAuthenticated(req, res, next) {
    // do any checks you want to in here

    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user.authenticated)
        return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/login');
}


//Authenticate before login
router.post('/login', (req, res)=> {
  let email = req.body.email;
  let password = req.body.password; 
  req.checkBody('email', 'email  is required').isEmail();
  req.checkBody('password', 'password is required').notEmpty();

  //Checking for Errors
  let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
       req.session.success = false;
       res.redirect('/login');
  }else {
         req.session.success = true;
        User.findOne({ email: email }, function(err, user) {
            if (!user) {
                   req.session.message = {
                    type: 'danger',
                    intro: '',
                    message: 'This email is not associated to any account'
                },
                   res.location('/login');
                   res.redirect('/login');
            }else {
                // Function to compare password
                function comparePassword (userPassword, hash, cb) {
                    bcrypt.compare(userPassword, hash, function (err, isMatch) {
                        if (err) throw err;
                        return cb(null, isMatch);
                    });

                }
                // Login to compare
                comparePassword(password, user.password, function (err, isMatch) {
                    if (err) {
                        console.log(err);
                        res.location('/login');
                        res.redirect('/login');
                    } else  {
                        if (!isMatch) {
                            req.session.message = {
                                type: 'danger',
                                intro: '',
                                message: 'Invalid Password'
                            },
                            console.log('Not match');
                            res.location('/login');
                            res.redirect('/login');

                        } else {
                            req.session.message = {
                                type: 'success',
                                intro: '',
                                message: 'Login Successfully'
                            },
                            console.log('Authentication successfully');
                            res.location('/member');
                            res.redirect('/member');
                        }
                    }

                });

            }
        });
  }
});



// GET /logout
router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.post('/changePassword', (req, res)=> {
    let email = req.body.email;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let cPassword = req.body.cPassword;
    req.checkBody('email', 'email  is required').isEmail();
    req.checkBody('oldPassword', 'email  is required').notEmpty();
    req.checkBody('newPassword', 'password is required').notEmpty().equals(cPassword).withMessage('Password confirmation failes');

    //Checking for Errors
    let errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        req.session.success = false;
        res.redirect('/member');
    }else {
        req.session.success = true;
        let session = req.sessionID;
       // let emailActive = session.email
        User.findOne({ email: email },  (err, user) => {
            if (!user) {
                req.session.message = {
                    type: 'danger',
                    intro: '',
                    message: 'No user is associated with this mail'
                },
                    res.location('/member');
                    res.redirect('/member');
            } else {
                let hashPassword = user.password;
                bcrypt.compare(oldPassword, hashPassword,  (err, isMatch) => {
                    if (err) throw  err;

                        console.log('password match');
                        bcrypt.hash(newPassword, 10,  (err, hash) => {
                            if (err) throw err;
                            user.password = hash;
                            console.log(hash);
                            // user.save();


                        });



                });


                console.log("active");
                res.redirect('/member');
            }

        });


    }
});



module.exports = router;














