import { Router } from 'express';
import loginHandler from './routes/api/login';
import logoutHandler from './routes/api/logout';
import registerHandler from './routes/api/register';
import forgotpwHandler from './routes/api/forgot-pw-pt1';
import forgotverifyHandler from './routes/api/forgot-pw-pt2';
//import {createCustomRateLimiter} from './rateLimit';

const router = Router();

// Example of a custom rate-limited endpoint
// router.get('/special-endpoint', createCustomRateLimiter({ max: 200, windowMs: 60000 }), (req, res) => {
//     res.send('This is a special endpoint with a custom rate limit.');
// });



router.all('/login', loginHandler);
router.all('/logout', logoutHandler);
router.all('/register', registerHandler);
router.all('/fpw', forgotpwHandler);
router.all('/fpwv', forgotverifyHandler);

export default router;
