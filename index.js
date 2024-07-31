import express from 'express';
import mongoose  from 'mongoose';
import dotenv from 'dotenv';
import UserRouter from './routes/User.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const corsOptions = {
  origin: 'http://localhost:3001',
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
dotenv.config();
const app=express();
app.use(cors(corsOptions));
app.use(cookieParser());
//The below line would convert the data that we pass form the frontend to json format ..
app.use(express.json());

app.use('/auth',UserRouter)

const PORT = process.env.port || 3000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mahesh:mkj1234@cluster0.wtxtlqw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {

})
  .then(() => {
    console.log("Connected to the database");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection error:", err);
  });
