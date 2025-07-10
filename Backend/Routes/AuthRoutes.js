import express from 'express';
import { Login, Signup , Metamask, CheckAuth, Logout } from '../Controllers/AuthControllers.js';
import { VerifyToken } from '../Middleware/Verify.js';

const authRouter = express.Router();

authRouter.post('/signup', Signup);
authRouter.post('/login', Login);
authRouter.get('/logout', Logout);
authRouter.get('/check', CheckAuth);
authRouter.post('/metamask', VerifyToken ,  Metamask);

export default authRouter;
