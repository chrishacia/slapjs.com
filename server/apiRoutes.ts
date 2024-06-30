import { Router } from 'express';
import loginHandler from './routes/api/login';
import logoutHandler from './routes/api/logout';
import registerHandler from './routes/api/register';
import forgotpwHandler from './routes/api/forgot-pw-pt1';
import forgotverifyHandler from './routes/api/forgot-pw-pt2';

const router = Router();

router.all('/login', loginHandler);
router.all('/logout', logoutHandler);
router.all('/register', registerHandler);
router.all('/fpw', forgotpwHandler);
router.all('/fpwv', forgotverifyHandler);

export default router;
