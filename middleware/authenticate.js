import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../Models/UserModels.js";

dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Invalid authorization format. Token must be provided as Bearer <token>." });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("JWT secret key is not defined in environment variables.");
    }

    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded token:", decoded);

    req.user = await User.findById(decoded?.userId);
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({ message: `Authentication error: ${error.message}` });
    }
  }
};

export default authenticate;
