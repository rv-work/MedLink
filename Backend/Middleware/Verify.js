import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/UserModel.js';

export const VerifyToken = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const tokenFromHeader = req.headers?.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({ msg: 'No token. Auth denied' });
    }

    const decoded = jwt.verify(token, 'secretkey');

    req.user = await UserModel.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
