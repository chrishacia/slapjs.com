const YAML = require('yamljs');
const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const swaggerUi = require('swagger-ui-express');

const router = express.Router();

const swaggerDocument = YAML.load(path.resolve(__dirname, './swagger.yaml'));

const isNotLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    next();
  }
};

// swagger
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// api routes
router.use('/api/login', routes.login);
router.use('/api/logout', routes.logout);
router.use('/api/register', routes.register);
router.use('/api/fpw', routes.forgotpw);
router.use('/api/fpwv', routes.forgotverify);


// frontend routes
// Public routes
router.get('/', (req, res) => { res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); });
router.get('/home', (req, res) => { res.render('home', { title: 'Home Page' }); });
router.get('/login', isLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Login', js: ['/dist/login.bundle.js'] }); });
router.get('/logout', (req, res) => { res.render('react', { layout: 'react', title: 'Login', js: ['/dist/logout.bundle.js'] }); });
router.get('/register', isLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Sign Up', js: ['/dist/register.bundle.js'] }); });

// Private routes
router.get('/dashboard', isNotLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Sign Up', js: ['/dist/dashboard.bundle.js'] }); });

// catch-all route
router.get('*', (req, res) => { res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); });

module.exports = router;
