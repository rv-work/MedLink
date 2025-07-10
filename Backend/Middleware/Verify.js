import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/UserModel.js';

export const VerifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ msg: 'No token. Auth denied' });

    const decoded = jwt.verify(token, 'secretkey');

    req.user = await UserModel.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
