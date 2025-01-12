import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModels.js";

dotenv.config();

const authenticate = async (req, res, next) => {
  // Extract token from the "Authorization" header
  const token = req.headers["authorization"]?.split(" ")[1];

  // If no token is provided, return an unauthorized response
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token using the secret key
    const secretKey = process.env.JWT_SECRET || "your_secret_key";
    const decoded = jwt.verify(token, secretKey);

    // Find the user based on the decoded token's user ID
    const user = await User.findById(decoded?.userId);

    // If no user is found, return a not found response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Attach the user object to the request for further use in routes
    req.user = user;

    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token errors such as expired or invalid token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({ message: "Authentication error." });
    }
  }
};

export default authenticate;
