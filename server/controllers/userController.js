import UserModel from "../Models/userModel.js";
import { Course } from "../Models/Course.js";
import Purchase from "../Models/Purchase.js";
import Stripe from "stripe";

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth().userId;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//users enrolled coruses with lecture link

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const userData = await UserModel.findById(userId).populate(
      "enrolledCourses"
    );
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Purchase Course
export const PurchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth().userId;
    const userData = await UserModel.findById(userId);
    const courseData = await Course.findById(courseId);
    if (!userData || !courseData) {
      return res.json({
        success: false,
        message: "Data not found (courseData or userData not found)",
      });
    }
    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.courPrice -
        (courseData.discount * courseData.courPrice) / 100
      ).toFixed(2),
    };
    const newPurchase = await Purchase.create(purchaseData);

    //* stripe Gateway Initiatize

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = "usd"; // Hardcoded for testing

    //create line itesm to for stripe
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(parseFloat(newPurchase.amount)) * 100,
        },
        quantity: 1,
      },
    ];

    // Ensure proper URL format
   
    
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString() 
      }
    })

    res.json({success :true,session_url:session.url})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
};
