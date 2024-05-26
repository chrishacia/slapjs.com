import YAML from 'yamljs';
import express from 'express';
import path from 'path';
import routes from './routes/index';
import swaggerUi from 'swagger-ui-express';
import { Request, Response, NextFunction } from 'express';
import { RequestWithSession } from './types/server-sessions';

const router = express.Router();

const swaggerDocument = YAML.load(path.resolve(__dirname, './swagger.yaml'));

const isNotLoggedIn = (req: RequestWithSession, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
};

const isLoggedIn = (req: RequestWithSession, res: Response, next: NextFunction) => {
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
router.get('/register-verify', isLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Activate Account', js: ['/dist/register-verify.bundle.js'] }); });
router.get('/forgot-password', isLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Forgot Password', js: ['/dist/forgot-password.bundle.js'] }); });
router.get('/forgot-verify', isLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Verify Identity', js: ['/dist/forgot-verify.bundle.js'] }); });

// Private routes
router.get('/dashboard', isNotLoggedIn, (req, res) => { res.render('react', { layout: 'react', title: 'Sign Up', js: ['/dist/dashboard.bundle.js'] }); });

// catch-all route
router.get('*', (req, res) => { res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); });

export default router;
