import express from 'express';
import updateRoleToEducator, { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData } from '../controllers/EducatorController.js';
import {protectEducator} from "../Middleware/Authmiddleware.js"
import upload from '../config/Multer.js'



const educatorRouter = express.Router();

//Add educator role

educatorRouter.get("/update-role", updateRoleToEducator)
educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)
educatorRouter.get('/courses',protectEducator,getEducatorCourses)
educatorRouter.get('/dashboard',protectEducator,educatorDashboardData)
educatorRouter.get("/enrolled-students",protectEducator,getEnrolledStudentsData)
export default educatorRouter;
