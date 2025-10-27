import UserModel from "../Models/userModel.js";
import { clerkClient } from "@clerk/express";
import { Course } from "../Models/Course.js";
import Purchase from "../Models/Purchase.js";
import Stripe from "stripe";
import CourseProgress from "../Models/courseProgress.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth().userId;
    let user = await UserModel.findById(userId);
    if (!user) {
      // Create the user in Mongo from Clerk profile if missing
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
        const imageUrl = clerkUser.imageUrl || "";
        user = await UserModel.create({ _id: userId, name, email, imageUrl });
      } catch (e) {
        return res.json({ success: false, message: "User not found" });
      }
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



//users enrolled coruses with lecture link

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const userData = await UserModel.findById(userId).populate("enrolledCourses");
    if (!userData) {
      // Gracefully handle when webhook hasn't created the user yet
      return res.json({ success: true, enrolledCourses: [] });
    }
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Return full course details (including lecture URLs) for an enrolled user
export const getEnrolledCourseById = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { id: courseId } = req.params;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isEnrolled = user.enrolledCourses?.some(
      (id) => id.toString() === courseId.toString()
    );
    if (!isEnrolled) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: not enrolled" });
    }

    const course = await Course.findById(courseId).populate({ path: "educator" });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    return res.json({ success: true, course });
  } catch (error) {
    return res.json({ success: false, message: error.message });
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
    if (!courseData) {
      return res.json({ success: false, message: "Course not found" });
    }
    if (!userData) {
      // If user record doesn't exist yet, create it from Clerk data in token
      const clerkUserId = userId;
      const email = req.auth().sessionClaims?.email || "";
      const name = req.auth().sessionClaims?.name || "";
      const imageUrl = req.auth().sessionClaims?.picture || "";
      await UserModel.create({ _id: clerkUserId, email, name, imageUrl });
    }
    const freshUser = userData || await UserModel.findById(userId);
    // Prevent purchase if already enrolled
    if (freshUser.enrolledCourses?.some((id) => id.toString() === courseId.toString())) {
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
    const discounted = (Number(courseData.coursePrice) || 0) * (1 - ((Number(courseData.discount) || 0) / 100));
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

    const serverUrl = process.env.PUBLIC_SERVER_URL || 'http://localhost:5000';
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${serverUrl}/api/user/confirm-checkout?session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(clientUrl + '/loading/my-enrollments')}`,
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

//todo ----------------------------------------------------------------------------------------------------->
// ye strripe kaam nahi kr rha to isliye use kiya hai mene baad me isko remove krke stirpe check krna hai
//  or isko remove kr dena hai pusblisble key or account dobarra banana hai stipe ka or ye remove krna hai
//* ---------------------------------------------------------------------------------------------------->
// Confirm checkout without relying on webhooks
export const confirmCheckout = async (req, res) => {
  try {
    const { session_id, redirect } = req.query;
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Missing session_id' });
    }
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripeInstance.checkout.sessions.retrieve(session_id);
    const { purchaseId } = session?.metadata || {};
    if (!purchaseId) {
      return res.status(400).json({ success: false, message: 'Missing purchaseId in session' });
    }

    const purchaseData = await Purchase.findById(purchaseId);
    if (!purchaseData) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    if (purchaseData.status !== 'completed' && session.payment_status === 'paid') {
      const userData = await UserModel.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());
      if (userData && courseData) {
        if (!courseData.enrolledStudents.some(id => id.toString() === userData._id.toString())) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }
        if (!userData.enrolledCourses.some(id => id.toString() === courseData._id.toString())) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }
      }
      purchaseData.status = 'completed';
      await purchaseData.save();
    }

    const redirectUrl = redirect || (process.env.PUBLIC_CLIENT_URL || 'http://localhost:5173') + '/loading/my-enrollments';
    res.redirect(302, redirectUrl);
  } catch (error) {
    // If redirect is provided, fail-soft by redirecting
    const redirectUrl = req.query?.redirect || (process.env.PUBLIC_CLIENT_URL || 'http://localhost:5173');
    try {
      return res.redirect(302, redirectUrl);
    } catch (_) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
//todo ----------------------------------------------------------------------------------------------------->
// ye strripe kaam nahi kr rha to isliye use kiya hai mene baad me isko remove krke stirpe check krna hai
//  or isko remove kr dena hai pusblisble key or account dobarra banana hai stipe ka or ye remove krna hai
//* ---------------------------------------------------------------------------------------------------->


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