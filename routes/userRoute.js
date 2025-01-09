import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../Models/UserModels.js'; // Use the correct capitalized model name


const router = express.Router();

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
         //create a new userSelect: 
         const newUser = await User.create({
            username, email, password:hashedPassword,
         });
         return response.status(201).json(newUser);
    } catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message})
    }
})

//route for user login
router.post('/login', async(request, response) =>{
    try{
        const {username, password} =request.body;

        //find the user by username
        console.log("working ..")

        const user = await User.findOne({ username});
        if(!user) {
            return response.status(404).json({message: 'user not found'});
        }

        //check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return response.status(401).json({message: 'Invalid password'});
        }
        //Genarate JWT token with userid included
        const token = jwt.sign({userid: user._id, isLogged: true}, 'your_secret_key', { expiresIn: '1h' });
        return response.status(200).json({token, username: user.username});
    } catch(error){
        console.log(error.message);
        response.status(500).send({message: error.message});
    }
})
export default router