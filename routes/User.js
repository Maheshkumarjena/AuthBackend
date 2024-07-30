import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router(); 


router.post('/signup', async (req, res) => {
  try {
    // Check the request body content
    console.log(req.body);

    const userName = req.body.user.name;
    const email = req.body.user.email;
    const password = req.body.user.password;

    console.log("userName", userName);
    console.log(email, "email");
    console.log(password, "password");

    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if the user already exists
    const existingUsername = await User.findOne({ userName });
    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    } else if (existingUsername) {
      return res.status(400).json({ message: 'Choose a different userName' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 5);

    // Create a new user
    const newUser = new User({
      userName: userName,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



  router.post('/login', async (req, res) => {
    console.log("Login attempt");
  
    const email = req.body.user.EmOrUn;
    const userName = req.body.user.EmOrUn;
    const password = req.body.user.password;
  
    console.log("Email or userName:", email);
    console.log("Password:", password);
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
  
    try {
      console.log("Searching for user by userName:", userName);
      const existinguserName = await User.findOne({ userName });
      console.log("Found user by userName:", existinguserName);
  
      console.log("Searching for user by email:", email);
      const existingEmail = await User.findOne({ email });
      console.log("Found user by email:", existingEmail);
  
      if (!existinguserName && !existingEmail) {
        return res.status(400).json({ message: 'User is not registered' });
      }
  
      const user = existingEmail || existinguserName;
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        return res.status(400).json({ message: 'Password is incorrect' });
      }
  
      const token = jwt.sign({ userName: user.userName }, process.env.KEY, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, maxAge: 360000 });
  
      return res.json({ status: true, message: 'Login successful' });
  
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
export default router;