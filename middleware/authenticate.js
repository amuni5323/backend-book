import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { User } from '../Models/UserModels.js';
import nodemailer from 'nodemailer';

dotenv.config();
console.log('Nodemailer imported successfully');
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

// Function to send confirmation email
const sendConfirmationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Welcome to Our App!</h1>
        <p>Please verify your email by clicking the link below:</p>
      <a href="http://localhost:5173/confirm-email/${token}" target="_blank">Verify Email</a>

      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


// Function to handle user registration and send the confirmation email
const userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username or email is already registered
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create and save new user
    const newUser = await User.create({
      username,
      email,
      password,  // Hash password here before saving if needed
    });

    // Generate email verification token
    const verificationToken = jwt.sign({ userId: newUser._id }, 'your-jwt-secret', { expiresIn: "1h" });

    // Send confirmation email
    sendConfirmationEmail(email, verificationToken);

    res.status(201).json({ message: "User created, please check your email to verify your account" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during signup" });
  }
};

// Email verification route
const verifyEmail = (req, res) => {
  const token = req.params.token;

  jwt.verify(token, 'your-jwt-secret', (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    User.findByIdAndUpdate(decoded.userId, { isVerified: true })
      .then(() => res.status(200).send("Email successfully verified"))
      .catch((error) => res.status(500).send("Error verifying email"));
  });
};
export default authenticate; 
export { userSignup, verifyEmail };
