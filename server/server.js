import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import { connect } from "mongoose";
import conntectDB from "./config/mongodb.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook, stripeWebhooks } from "./controllers/webhooks.js";
import UserModel from "./Models/userModel.js";
import Purchase from "./Models/Purchase.js";
import { Course } from "./Models/Course.js";
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
app.use(clerkMiddleware())

// Stripe webhook endpoint - must be before express.json() middleware
app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Parse JSON for all other routes below
app.use(express.json());

//*routes

app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});
app.post("/clerk", clerkWebhook);
app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter); 
app.use("/api/user", UserRouter);


//*listen to server (only when not running on Vercel serverless)

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
