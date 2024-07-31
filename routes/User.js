import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

const verifyUser = async (req,res,next)=>{
  try{
    const token =req.cookies.token;
    if(!token){
      return res.json({status:false,message:"no token"});
    }
    const decoded= await jwt.verify(token,process.env.KEY);
    next()
  }
  catch(err){
    return res.json(err,"error from server");
  }
}


// signup router
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


// login router
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





//FrogotPassword router
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  console.log(email);

  try {
    const user = await User.findOne({ email });
    console.log(user, "User from database");

    if (!user) {
      return res.json({ status: false, message: "User is not registered" });
    }

    const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '5m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      text: `Click the link to reset your password: http://localhost:3001/resetpassword/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.json({ status: false, message: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (error) {
    console.log(error, "Error from catch block");
    return res.json({ status: false, message: "An error occurred" });
  }
});



// Resetpassword router
router.put('/resetpassword/:token', async (req, res) => {
  const token = req.params.token; 
  const { password } = req.body;

  try {
    const decoded = await jwt.verify(token, process.env.KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashPassword });
    return res.json({ status: true, message: "updated password" });
  } catch (err) {
    console.error(err);
    return res.json({ status: false, message: "invalid token" });
  }
});


router.get('/verify',verifyUser,(req,res,next)=>{
  return res.json({status :true , message : "authorized"})
})




export default router;