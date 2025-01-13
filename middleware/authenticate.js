import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { User } from '../Models/UserModels.js';

dotenv.config();

const authenticate = async (req, res, next) => {
  const token = req.headers
  ['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const secretKey = '123454dfngmdffbdfmgnmdfgnmdfndfn!kfejrkewjk';
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded)
    req.user = await User.findById(decoded?.userid);
    console.log(req.user)

    if (!req.user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token.' });
    } else {
      return res.status(500).json({ message: 'Authentication error.' });
    }
  }
};

export default authenticate;
