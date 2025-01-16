import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../Models/UserModels.js'; // Use the correct capitalized model name

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});





//router for user sing up 




router.post('/SignUp', async(request, response) =>{
    try{
        const {username, email, password } = request.body;

        //check if the username or email is already registered
        const existinguser = await User.findOne({$or: [{username}, {email}]});
        if(existinguser) {
            return response.status(400).json({message: 'username or email already exists'});
        }
        //hash the password
         const hashedPassword = await bcrypt.hash(password, 10);
         const emailConfirmationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

         //create a new userSelect: 
         const newUser = await User.create({
            username, email, password:hashedPassword,
            emailConfirmationToken,
         });


        //  return response.status(201).json(newUser);
        const confirmationLink = `http:/localhost:5173/confirm-email/${emailConfirmationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Confirm Your Email',
            html: `<p>Click the link below to confirm your email:</p>
                   <a href="${confirmationLink}">Confirm Email</a>`,
        };

        await transporter.sendMail(mailOptions);

        return response.status(201).json({
            message: 'User registered successfully. Please check your email to confirm your account.',
        });
    } catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message})
    }
});


// Route for confirming email
router.get('/confirm-email/:token', async (request, response) => {
    try {
        const { token } = request.params;

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailConfirmed) {
            return response.status(400).json({ message: 'Email already confirmed' });
        }

        // Mark email as confirmed
        user.isEmailConfirmed = true;
        user.emailConfirmationToken = null;
        await user.save();

        response.status(200).json({ message: 'Email confirmed successfully!' });
    } catch (error) {
        console.error(error.message);
        response.status(400).json({ message: 'Invalid or expired token' });
    }
});




//route for user login
router.post('/Login', async(request, response) =>{
    try{
        const {username, password} =request.body;

        //find the user by username
        console.log("working ..")

        const user = await User.findOne({ username});
        if(!user) {
            return response.status(404).json({message: 'user not found'});
        }
        console.log(user)

        if (!user.isEmailConfirmed) {
            return response.status(403).json({ message: 'Please confirm your email before logging in' });
        }


        //check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return response.status(401).json({message: 'Invalid password'});
        }
        //Genarate JWT token with userid included
        const token = jwt.sign({userid: user._id, isLogged: true}, '123454dfngmdffbdfmgnmdfgnmdfndfn!kfejrkewjk', { expiresIn: '1h' });
        return response.status(200).json({token, username: user.username});
    } catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message});
    }
})
export default router