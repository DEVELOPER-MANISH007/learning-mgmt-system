import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import { connect } from "mongoose";
import conntectDB from "./config/mongodb.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook, stripeWebhooks } from "./controllers/webhooks.js";
import UserModel from "./Models/userModel.js";
import educatorRouter from "./Routes/educatorRoutes.js";    
import connectCloudinary from "./config/Cloudinary.js";
import courseRouter from "./Routes/CourseRoutes.js";
import UserRouter from "./Routes/UserRoutes.js";

//* Initiallze express

const app = express();

//*conntect to database
await conntectDB();
await connectCloudinary();


//middleware

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

//*routes

app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});

app.get("/loading/my-enrollments", (req, res) => {
  res.send("Payment successful! Redirecting to your enrollments...");
});
app.post("/clerk", express.json(), clerkWebhook);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter); 
app.use("/api/user", express.json(),UserRouter);
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//*listen to server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
