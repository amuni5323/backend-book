import express from "express";
import http from "http";
import mongoose from "mongoose";
import { PORT, mongoDBURL } from "./Config.js";

import cors from 'cors';
import booksRoutes from './routes/booksRoutes.js';
import userRoute from './routes/userRoute.js';
// import authenticate from './middleware/authenticate.js';

// Initialize the express app
const app = express();
app.use(express.urlencoded({extended:true}))


// const PORT ="5555" || PORT
// Create the HTTP server
const server = http.createServer(app);

// Middleware setup
app.use(express.json()); 
app.use(cors()); 

let corsOptions = {
    origin : ['https://asb-frontend1.vercel.app/'],
 }
 
 app.use(cors(corsOptions))
// app.use('/api/books', authenticate, booksRoutes);
// Root route to check if the server is running
app.get('/', (req, res) => {
    console.log(req);
    res.status(200).send('Welcome to MERN Stack Tutorial');
});

// Books routes
app.use('/books', booksRoutes);
app.use('/user', userRoute);

// const PORT = process.env.PORT || 5555;
// Connect to MongoDB and start the server
mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log("MongoDB connected successfully");
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
    app.use(
        cors({
          origin: 'https://asb-frontend1.vercel.app', 
          methods: ['GET', 'POST', 'PUT', 'DELETE'], 
          credentials: true,
        })
      );
      