import express from 'express';
import UserModel from '../Models/userModel.js';
import { getUserData, userEnrolledCourses, PurchaseCourse } from '../controllers/userController.js';


 const UserRouter = express.Router();



UserRouter.get('/data',getUserData);
UserRouter.get('/enrolled-courses',userEnrolledCourses);
UserRouter.post('/purchase',PurchaseCourse);

export default UserRouter;