import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/UserModel.js';
import { Doctor } from '../Models/Doctor.js';

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


    const decoded = jwt.verify(token, 'secret');

    req.user = await UserModel.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};


export const VerifyDoctor = async (req, res, next) => {
  try {
    const user = req.user; 

    const isDoctor = await Doctor.findOne({user : user._id})

    if(!isDoctor){
      return  res.status(200).json({ success : false,  msg: 'Only Doctor Can Create' });
    }

    req.doctor = await Doctor.findById(isDoctor._id);
    
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};