const bcrypt = require('bcryptjs');
const { check, oneOf, validationResult } = require('express-validator');
const User = require('../models/user');
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};
  
exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: message,
      oldInput: {
        email: '',
        password: '',
        confirmPassword: ''
      }
      
    });
  };

  exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errors.array()[0].msg
      });
    }
    User.findOne({where: { email: email }})
      .then(user => {
        if (!user) {
          console.log('Invalid email or password.');
          req.flash('error','Invalid email or password.');
          return res.redirect('/login');
        }
        bcrypt
          .compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/login');
          });
      })
      .catch(err => console.log(err));
  };
  
    exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword
      }
    });
  }
  User.findOne({ where: { email: email }})
    .then(userDoc => {
      if (userDoc) {
        return res.redirect('/signup');
      }
     /* const user = new User({
        email: email,
        password: password,
        
      });*/

     // return user.save();
     return bcrypt.hash(password, 12).then( hashedPassword => {
      return User.create({
        email: email,
        password: hashedPassword,
        
      });
    })
    .then(user =>{
      return user.createCart({
        userId : user.id
      });
    })
    .then(result => {
      res.redirect('/login');
    });
    })
    .catch(err => {
      console.log(err);
    });
};

  exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };
  

