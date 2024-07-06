import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import apiRoutes from './apiRoutes';
import { RequestWithSession } from './types/server-sessions';
import adminRoutes from './adminRoutes';

const router = express.Router();

const swaggerDocument = YAML.load(path.resolve(__dirname, './swagger.yaml'));

// Middleware for checking authentication status
const authMiddleware = {
  isNotLoggedIn: (req: RequestWithSession, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      res.redirect('/login');
    } else {
      next();
    }
  },
  isLoggedIn: (req: RequestWithSession, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      res.redirect('/dashboard');
    } else {
      next();
    }
  }
};

// Swagger documentation route
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// adming routes
router.use('/admin', adminRoutes);

// API routes
router.use('/api', apiRoutes);

// Define a function to streamline the client route registration
const clientRoutes = [
  { path: '/', filePath: path.join(__dirname, '..', 'public', 'index.html') },
  { path: '/home', view: 'home', title: 'Home Page' },
  { path: '/login', view: 'react', layout: 'react', title: 'Login', js: ['/dist/login.bundle.js'], middleware: authMiddleware.isLoggedIn },
  { path: '/logout', view: 'react', layout: 'react', title: 'Login', js: ['/dist/logout.bundle.js'] },
  { path: '/register', view: 'react', layout: 'react', title: 'Sign Up', js: ['/dist/register.bundle.js'], middleware: authMiddleware.isLoggedIn },
  { path: '/register-verify', view: 'react', layout: 'react', title: 'Activate Account', js: ['/dist/register-verify.bundle.js'], middleware: authMiddleware.isLoggedIn },
  { path: '/forgot-password', view: 'react', layout: 'react', title: 'Forgot Password', js: ['/dist/forgot-password.bundle.js'], middleware: authMiddleware.isLoggedIn },
  { path: '/forgot-verify', view: 'react', layout: 'react', title: 'Verify Identity', js: ['/dist/forgot-verify.bundle.js'], middleware: authMiddleware.isLoggedIn },
  { path: '/dashboard', view: 'react', layout: 'react', title: 'Dashboard', js: ['/dist/dashboard.bundle.js'], middleware: authMiddleware.isNotLoggedIn },
  { path: '/profile', view: 'react', layout: 'react', title: 'Profile', js: ['/dist/profile.bundle.js'], middleware: authMiddleware.isNotLoggedIn },
  { path: '/settings', view: 'react', layout: 'react', title: 'Settings', js: ['/dist/settings.bundle.js'], middleware: authMiddleware.isNotLoggedIn },
  { path: '/chat', view: 'react', layout: 'react', title: 'Chat', js: ['/dist/chat.bundle.js'], middleware: authMiddleware.isNotLoggedIn },
  { path: '/message/:msgId', view: 'react', layout: 'react', title: 'Messages', js: ['/dist/message.bundle.js'], middleware: authMiddleware.isNotLoggedIn },
  { path: '/messages/:boxType?', view: 'react', layout: 'react', title: 'Messages', js: ['/dist/messages.bundle.js'], middleware: authMiddleware.isNotLoggedIn }
];

// Register client routes
clientRoutes.forEach(route => {
  const { path, filePath, view = '', layout = '', title, js, middleware } = route;
  if (middleware) {
    router.get(path, middleware, (req: Request, res: Response) => {
      if (filePath) {
        res.sendFile(filePath);
      } else {
        res.render(view, { layout, title, js });
      }
    });
  } else {
    router.get(path, (req: Request, res: Response) => {
      if (filePath) {
        res.sendFile(filePath);
      } else {
        res.render(view, { layout, title, js });
      }
    });
  }
});

// Catch-all route
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index_404.html'));
});

export default router;
