import express from 'express';
import UserModel from '../Models/userModel.js';

// -------------------------------------------------------------------------->temp hai
import { getUserData, userEnrolledCourses, PurchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating, confirmCheckout, getEnrolledCourseById } from '../controllers/userController.js';
// -------------------------------------------------------------------------------->

 const UserRouter = express.Router();



UserRouter.get('/data',getUserData);
UserRouter.get('/enrolled-courses',userEnrolledCourses);
UserRouter.get('/enrolled-courses/:id', getEnrolledCourseById);
UserRouter.post('/purchase',PurchaseCourse);
UserRouter.post('/enroll-course',PurchaseCourse); // alias for client compatibility
// --------------------------------------------------------------------------->
UserRouter.get('/confirm-checkout', confirmCheckout);
// ---------------------------------------------------------------------------> temp hai stripe kaam nahi kr rha to lagaya hai baad me remove bhi krna hai  jyda jankari ke lye readme pdhe 
UserRouter.post('/update-course-progress',updateUserCourseProgress  )
UserRouter.post('/get-course-progress',getUserCourseProgress)
UserRouter.post('/add-rating',addUserRating)
export default UserRouter;