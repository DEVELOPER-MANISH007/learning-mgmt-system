import express from 'express';
import UserModel from '../Models/userModel.js';
import { getUserData, userEnrolledCourses, PurchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating } from '../controllers/userController.js';


 const UserRouter = express.Router();



UserRouter.get('/data',getUserData);
UserRouter.get('/enrolled-courses',userEnrolledCourses);
UserRouter.post('/purchase',PurchaseCourse);
UserRouter.post('/update-course-progress',updateUserCourseProgress  )
UserRouter.post('/get-course-progress',getUserCourseProgress)
UserRouter.post('/add-rating',addUserRating)
export default UserRouter;