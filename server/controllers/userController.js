import UserModel from "../Models/userModel.js";
import { Course } from "../Models/Course.js";
import Purchase from "../Models/Purchase.js";
import Stripe from "stripe";
import CourseProgress from "../Models/courseProgress.js";

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
    // Prevent purchase if already enrolled
    if (userData.enrolledCourses?.some((id) => id.toString() === courseId.toString())) {
      return res.json({ success: false, message: "Already enrolled" });
    }
    // Prevent duplicate paid purchases
    const existingPaid = await Purchase.findOne({ userId, courseId, status: "completed" });
    if (existingPaid) {
      return res.json({ success: false, message: "Course already purchased" });
    }
    // Ensure the course is available for purchase
    if (courseData.isPublished === false) {
      return res.json({ success: false, message: "Course not available" });
    }
    // Compute numeric discounted amount (dollars)
    const discounted = courseData.courPrice * (1 - ((courseData.discount || 0) / 100));
    const amountDollars = Math.round(discounted * 100) / 100; // keep 2dp as Number
    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: amountDollars,
    };
    const newPurchase = await Purchase.create(purchaseData);

    //* stripe Gateway Initiatize

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = "usd"; // Hardcoded for testing

    //TODO create line itesm to for stripe
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.round(amountDollars * 100),
        },
        quantity: 1,
      },
    ];

    // Ensure proper URL format - remove trailing slash and validate
    let clientUrl = origin;
    if (!clientUrl) {
      clientUrl = 'http://localhost:5173'; // Default for development
    }
    // Remove trailing slash if present
    clientUrl = clientUrl.replace(/\/$/, '');

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${clientUrl}/loading/my-enrollments`,
      cancel_url: `${clientUrl}/`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString()
      }
    })



    res.json({ success: true, session_url: session.url })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
};



//*Update User Course Progress

export const updateUserCourseProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const userId = req.auth().userId;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: "lecture already completed" })
      }
      progressData.lectureCompleted.push(lectureId)
      await progressData.save()
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId]
      })
    }
    res.json({ success: true, message: 'progress Updatd' })

  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


//todo get user course Progress

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth().userId
    const { courseId } = req.body
    const progressData = await CourseProgress.findOne({ userId, courseId })
    res.json({ success: true, progressData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }

}



//* Add user Rating to Coruse
export const addUserRating = async (req, res) => {

  const userId = req.auth().userId
  const { courseId, rating } = req.body;

  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {

    return res.json({ success: false, message: "Invalid Details" })
  }
try {
  
  const course = await Course.findById(courseId)
  if(!course){
    return res.json({success:false, message:'course not found'})
  }
  const user =  await UserModel.findById(userId)
  if(!user || !user.enrolledCourses?.some(id => id.toString() === courseId.toString())){
    return res.json({success:false,message:'User has not purchased this course'})
  }

  const existingRatingIndex =  course.courseRating.findIndex(r=>r.userId===userId)
  if(existingRatingIndex> -1){
    course.courseRating[existingRatingIndex].rating = rating
  }else{
    course.courseRating.push({userId,rating})
  }
  await course.save()

} catch (error) {
  res.json({success:false,message:error.message})
}

}