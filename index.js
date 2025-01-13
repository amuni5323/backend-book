import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { PORT, mongoDBURL } from "./Config.js";
import booksRoutes from "./routes/booksRoutes.js";
import userRoute from "./routes/userRoute.js";

const app = express();
app.use((req, res, next) => {
  console.log(`Request made to: ${req.url} with method: ${req.method}`);
  next();
});

// // CORS configuration
// let corsOptions = {
//   origin: (origin, callback) => {
//     console.log("Request Origin:", origin);
//     const allowedOrigins = ["https://asb-frontend1.vercel.app"];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// };

// Apply CORS middleware
app.use(cors("*"));
// app.options("*", cors(corsOptions)); // Handle preflight requests

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