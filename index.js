import express from "express";
import http from "http";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import booksRoutes from "./routes/booksRoutes.js";
import userRoute from "./routes/userRoute.js";
import { PORT, mongoDBURL } from "./Config.js";

// Initialize the express app
const app = express();

// CORS configuration
let corsOptions = {
  origin: "https:/asb-frontend1.vercel.app/", // Your frontend's URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


// Root route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to MERN Stack Tutorial");
});

// Books and user routes
app.use("/books", booksRoutes);
app.use("/user", userRoute);

// Connect to MongoDB and start the server
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT || 5555, () => {
      console.log(`App is listening on port ${PORT || 5555}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
