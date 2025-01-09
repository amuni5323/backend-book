import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { User } from '../Models/UserModels.js';
dotenv.config()
// Middleware to verify JWT token
const authenticate = async(req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
  
    

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const secretKey ='your_secret_key';
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded)
   
 req.user= await User.findById(decoded?.userid)




    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log("Token Expired")
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    } else if (error.name === 'JsonWebTokenError') {
      console.log("Jwt token erroor")
      return res.status(400).json({ message: 'Invalid token. Please provide a valid token.' });
    } else {
      console.log("else executed")
      return res.status(500).json({ message: 'Something went wrong during authentication.' });
    }
  }
}

export default authenticate;
